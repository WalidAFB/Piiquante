const mongoose = require('mongoose')
uniqueValidator = require('mongoose-unique-validator')

// Définition du schéma de l'utilisateur
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
})

// Utilisation du plugin "uniqueValidator" pour ajouter une validation de l'email unique au schéma
userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)
