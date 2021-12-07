'use strict'

const path = require('path');

// import other routes
const uploadRoutes = require('./upload');
const serveRoutes = require('./serve');
const networkRoutes = require('./network');

const appRouter = (app, fileServer) => {

    // default route
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname + '/../templates/index.html'));
    });

    // other routes
    uploadRoutes(app);
    serveRoutes(app, fileServer);
    networkRoutes(app);
};


module.exports = appRouter;