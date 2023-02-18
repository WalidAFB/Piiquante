const mongoose = require('mongoose')

// Définition du schéma de la sauce
const sauceSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    manufacturer: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    mainPepper: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    heat: {
        type: Number,
        min: 1,
        max: 10,
        required: true,
    },
    usersLiked: {
        type: [String],
        required: true,
    },
    usersDisliked: {
        type: [String],
        required: true,
    },
})

module.exports = mongoose.model('Sauce', sauceSchema)
