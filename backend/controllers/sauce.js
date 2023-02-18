const Sauce = require('../models/Sauce');
const fs = require('fs');

// Fonction qui met à jour les nombres de likes et de dislikes pour une sauce donnée
function computeLikeDislike(sauce) {
    sauce.likes = sauce.usersLiked.length;
    sauce.dislikes = sauce.usersDisliked.length;
    return sauce;
}

// Récupère toutes les sauces de la base de données
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((saucesColl) => {
            const sauces = JSON.parse(JSON.stringify(saucesColl));
            // Met à jour les nombres de likes et de dislikes pour chaque sauce
            res.status(200).json(
                sauces.map((sauce) => {
                    return computeLikeDislike(sauce);
                })
            );
        })
        .catch((error) => res.status(400).json({ error }));
};

// Récupère une sauce spécifique de la base de données
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            sauces = JSON.parse(JSON.stringify(sauce));
            // Met à jour les nombres de likes et de dislikes pour la sauce
            res.status(200).json(computeLikeDislike(sauces));
        })
        .catch((error) => res.status(404).json({ error }));
};

// Ajoute une nouvelle sauce à la base de données
exports.postSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;

    const sauce = new Sauce({
        ...sauceObject,
        usersLiked: [],
        usersDisliked: [],
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
            req.file.filename
        }`,
    });

    sauce
        .save()
        .then(() => {
            res.status(201).json({ message: 'Objet enregistré !' });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
    // Vérifier s'il y a une image dans la requête
    const sauceObject = req.file
        ? {
              // Si une image est présente, récupérer les informations de la sauce depuis le corps de la requête et ajouter l'URL de l'image
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                  req.file.filename
              }`,
          }
        : { ...req.body };

    // Supprimer l'identifiant de l'utilisateur de l'objet sauce pour éviter une modification frauduleuse
    delete sauceObject._userId;

    // Trouver la sauce à modifier
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Vérifier si l'utilisateur est autorisé à modifier la sauce
            if (sauce.userId != req.auth.userId) {
                // Si l'utilisateur n'est pas autorisé, renvoyer une erreur 403
                res.status(403).json({ message: 'Not authorized' });
            } else {
                // Si l'utilisateur est autorisé, mettre à jour la sauce avec les nouvelles informations
                Sauce.updateOne(
                    { _id: req.params.id },
                    { ...sauceObject, _id: req.params.id }
                )
                    .then(() =>
                        res.status(200).json({ message: 'Objet modifié!' })
                    )
                    .catch((error) => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    // Trouver la sauce à supprimer
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Vérifier si l'utilisateur est autorisé à supprimer la sauce
            if (sauce.userId != req.auth.userId) {
                // Si l'utilisateur n'est pas autorisé, renvoyer une erreur 401
                res.status(401).json({ message: 'Not authorized' });
            } else {
                // Si l'utilisateur est autorisé, supprimer l'image de la sauce et ensuite la sauce elle-même
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: 'Objet supprimé !',
                            });
                        })
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

exports.likeDislike = (req, res, next) => {
    // Recherche la sauce correspondante à l'ID fourni
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Supprime l'ID de l'utilisateur de la liste des likes et des dislikes
            sauce.usersLiked = sauce.usersLiked.filter(
                (userId) => req.body.userId != userId
            );
            sauce.usersDisliked = sauce.usersDisliked.filter(
                (userId) => req.body.userId != userId
            );
            // Ajoute l'ID de l'utilisateur à la liste des likes ou des dislikes selon ce qui a été choisi
            if (req.body.like === 1) {
                sauce.usersLiked.push(req.body.userId);
            } else if (req.body.like === -1) {
                sauce.usersDisliked.push(req.body.userId);
            }
            // Met à jour la sauce dans la base de données
            return Sauce.updateOne({ _id: req.params.id }, sauce);
        })
        .then((sauce) => {
            res.status(200).json({ message: 'Opinion donnée !' });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};
