'use strict'


const uploadRoutes = (app) => {

    // CREATE BACKUP OF MULTIPLE DBs
    app.post('/upload', function(req, res) {
        let sampleFile;
        let uploadPath;
      
        if (!req.files || Object.keys(req.files).length === 0) {
          return res.status(400).send('No files were uploaded.');
        }
      
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        sampleFile = req.files.sampleFile;
        uploadPath = '/usr/src/app/public/' + sampleFile.name;
      
        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv(uploadPath, function(err) {
          if (err)
            return res.status(500).send(err);
      
          res.status(200).send('File uploaded!');
        });
      });

};

module.exports = uploadRoutes;