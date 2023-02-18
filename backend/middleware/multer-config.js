const multer = require('multer')

// Définition d'un objet avec les types MIME des images supportés et leur extension correspondante
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
}

// Configuration de la méthode de stockage de Multer avec destination et nom de fichier personnalisé
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images') // Le dossier de destination pour les fichiers sera "images"
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_') // Remplacement des espaces dans le nom de fichier par des underscores
        const extension = MIME_TYPES[file.mimetype] // Récupération de l'extension du fichier à partir de son type MIME
        callback(null, name + Date.now() + '.' + extension) // Création du nom de fichier final avec la date actuelle et son extension
    },
})

module.exports = multer({ storage: storage }).single('image')

