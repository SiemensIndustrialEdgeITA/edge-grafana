'use strict'

const path = require('path');
// packages for API Server App
const express = require('express');
const cors = require('cors');
const app = express();
var fs = require('fs')
var https = require('https')

// an express module to upload files
const fileUpload = require('express-fileupload');

// server for serving static files
const statics = require('node-static');

// set public folder for static server
var fileServer = new statics.Server('./public');


// define some default properties for server
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
//app.use(express.static(path.join(__dirname, '/static')));
app.use(express.static('static'));
// use the file uploader
app.use(fileUpload());

// load all API Routes
const routes = require('./routes/routes.js')(app, fileServer);

// create server HTTPS
const server = https.createServer({
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.cert')
  }, app)
  .listen(5000, function () {
    console.log('listening on port %s...', server.address().port);
  })

// create server HTTP
// const server = app.listen(5000, () => {
//     console.log('listening on port %s...', server.address().port);
// });