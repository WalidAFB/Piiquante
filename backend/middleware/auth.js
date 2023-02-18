// Importation du module "jsonwebtoken" pour la création et la vérification des tokens d'authentification
const jwt = require('jsonwebtoken');

// Définition d'un middleware pour vérifier la validité du token d'authentification
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId,
        };
        // Appel de la prochaine fonction du middleware
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};
