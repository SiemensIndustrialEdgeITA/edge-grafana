'use strict'

const fs = require('fs');
const path = require('path');

const serveRoutes = (app, fileServer) => {

  // SERVE FILE FROM PUBLIC FOLDER
  app.get('/files/:filename', function (req, res) {

    let filename = req.params["filename"];
    fileServer.serveFile(filename, 200, {}, req, res);

  });

  // SERVE FILE LIST IN PUBLIC FOLDER
  app.get('/fileslist', function (req, res) {

    let bodyRes = { "files": [] };
    fs.readdir("/usr/src/app/public/", (err, files) => {
      if (files.length > 0) {
        files.forEach(file => {
          bodyRes.files.push(file);
        });
      }
      res.status(200).send(bodyRes);
    });
  });


  // DELETE ALL FILES IN PUBLIC FOLDER
  app.get('/filesclean', function (req, res) {
    console.log(req)
    // delete all files in backup dump backup folder
    fs.readdirSync("/usr/src/app/public/").forEach((file, index) => {
      // delete file
      fs.unlinkSync(path.join("/usr/src/app/public/", file));
    });

    res.status(200).send({"msg":"All files deleted successfully."});
  });

};

module.exports = serveRoutes;