const Sauce = require("../models/Sauce");
const fs = require("fs");

function computeLikeDislike(sauce) {
    sauce.likes = sauce.usersLiked.length
    sauce.dislikes = sauce.usersDisliked.length
    return sauce
}

exports.getAllSauces = (req, res, next) => {

    Sauce.find()
        .then((saucesColl) => {
            const sauces = JSON.parse(JSON.stringify(saucesColl))
            res.status(200).json(sauces.map(sauce => { return computeLikeDislike(sauce) }))
        })
        .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            sauces = JSON.parse(JSON.stringify(sauce))
            res.status(200).json(computeLikeDislike(sauces))
        })
        .catch((error) => res.status(404).json({ error }));
};

exports.postSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;

    const sauce = new Sauce({
        ...sauceObject,
        usersLiked: [],
        usersDisliked: [],
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });

    sauce
        .save()
        .then(() => {
            res.status(201).json({ message: "Objet enregistré !" });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file
        ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        }
        : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "Not authorized" });
            } else {
                Sauce.updateOne(
                    { _id: req.params.id },
                    { ...sauceObject, _id: req.params.id }
                )
                    .then(() => res.status(200).json({ message: "Objet modifié!" }))
                    .catch((error) => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: "Not authorized" });
            } else {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: "Objet supprimé !",
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
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            sauce.usersLiked = sauce.usersLiked.filter(userId => req.body.userId != userId)
            sauce.usersDisliked = sauce.usersDisliked.filter(userId => req.body.userId != userId)
            if (req.body.like === 1) {
                sauce.usersLiked.push(req.body.userId)
            } else if (req.body.like === -1) {
                sauce.usersDisliked.push(req.body.userId)
            }
            return Sauce.updateOne({ _id: req.params.id }, sauce)
        })
        .then((sauce) => { res.status(200).json({ message: "Opinion donnée !"}) })
        .catch(error => res.status(400).json({ error }));
};