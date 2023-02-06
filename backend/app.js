const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config()
app.use(express.json())

const userRoute = require('./routes/user')
const sauceRoute = require('./routes/sauce')

mongoose.connect(process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(mongoSanitize());

app.use('/api/auth', userRoute);
app.use('/api/sauces', sauceRoute)
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;