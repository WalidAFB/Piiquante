const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    // Hashage du mot de passe de l'utilisateur avant de le sauvegarder dans la base de données
    bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
            // Création d'un nouvel utilisateur avec l'email et le mot de passe hashé
            const user = new User({
                email: req.body.email,
                password: hash,
            });
            // Sauvegarde de l'utilisateur dans la base de données
            user.save()
                .then(() =>
                    res.status(201).json({ message: 'Utilisateur créé !' })
                )
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // Recherche de l'utilisateur dans la base de données à partir de son email
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return res
                    .status(401)
                    .json({ message: 'Paire login/mot de passe incorrecte' });
            }
            // Vérification du mot de passe entré par l'utilisateur avec le mot de passe hashé dans la base de données
            bcrypt
                .compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                        return res.status(401).json({
                            message: 'Paire login/mot de passe incorrecte',
                        });
                    }
                    // Si la paire login/mot de passe est correcte, générer un token d'authentification à partir de l'ID de l'utilisateur
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET'
                        ),
                    });
                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};
