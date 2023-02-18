// Import du module http et de l'application Express
const http = require('http');
const app = require('./app');

// Normalisation du port d'écoute de l'application
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // Si le port n'est pas un nombre, on retourne simplement la valeur
        return val;
    }
    if (port >= 0) {
        // Si le port est un nombre positif, on retourne le port
        return port;
    }
    // Dans tous les autres cas, on retourne false
    return false;
};

// On récupère le port d'écoute de l'application, soit à partir de la variable d'environnement PORT, soit en utilisant le port par défaut 3000
const port = normalizePort(process.env.PORT || '3000');

// On configure l'application pour utiliser le port d'écoute
app.set('port', port);

// Gestionnaire d'erreurs qui est appelé en cas d'erreur lors de l'écoute du port
const errorHandler = error => {
    if (error.syscall !== 'listen') {
        // Si l'erreur ne concerne pas l'écoute du port, on la propage
        throw error;
    }
    // Sinon, on récupère l'adresse du serveur et on construit un message d'erreur approprié en fonction du type d'erreur
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// On crée un serveur HTTP en utilisant l'application Express
const server = http.createServer(app);

// On écoute les événements d'erreur et de démarrage du serveur
server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    // On affiche un message indiquant que le serveur est en cours d'écoute sur le port spécifié
    console.log('Listening on ' + bind);
});

// On démarre le serveur en écoutant sur le port spécifié
server.listen(port);
