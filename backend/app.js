const express = require('express');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
require('dotenv').config();

const app = express();
// middleware pour parser le body des requêtes en JSON
app.use(express.json()); 
 // importation des routes pour les utilisateurs
const userRoute = require('./routes/user');
// importation des routes pour les sauces
const sauceRoute = require('./routes/sauce'); 

// connexion à la base de données MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // autoriser toutes les origines
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    ); // autoriser certains en-têtes dans les requêtes
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    ); // autoriser certaines méthodes HTTP
    next();
});

// middleware pour éviter les injections dans les champs MongoDB
app.use(mongoSanitize());
 // route pour l'authentification des utilisateurs
app.use('/api/auth', userRoute);
// route pour les opérations sur les sauces
app.use('/api/sauces', sauceRoute); 
// middleware pour servir les images dans la réponse
app.use('/images', express.static(path.join(__dirname, 'images'))); 

module.exports = app;
