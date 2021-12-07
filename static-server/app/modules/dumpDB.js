'use strict'

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

// prepare base path for backup file saving
const dumpBasePath = '/backups/';

// read configured environment variables
const dbUrl = process.env.MYSQL_URL;
const dbRootPassword = process.env.MYSQL_ROOT_PASSWORD;


// export dump function
module.exports.cleanDumpFiles = (callback, safePwd) => {

    // this will check the root password sent by API Client
    if (safePwd == dbRootPassword)
    {
        // delete all files in backup dump backup folder
        fs.readdirSync(dumpBasePath).forEach((file, index) => {
            // delete file
            fs.unlinkSync(path.join(dumpBasePath, file));
          });
        console.log(dumpBasePath + " folder cleaned");
        callback(null, dumpBasePath + " folder cleaned");
    }
    else
    {
        let err = "Root Password not correct!";
        console.log(err);
        // send error to callback
        callback(err, null);
    }
};

// export dump function
module.exports.dumpToFile = (callback, dbBackupList, safePwd) => {

    // this will check the root password sent by API Client
    if (safePwd == dbRootPassword)
    {
        // create name based on datetime
        const dumpFileName = 'mysqlbackup_' + new Date().toISOString().substring(0,19) + '.dump.sql';
        const dumpFilePath = dumpBasePath + dumpFileName;

        // create DB Dump command
        const dumpCmd = spawn('mysqldump', [
            '-h',
            dbUrl,
            '-P',
            '3306',
            '-u',
            'root',
            '-p' + dbRootPassword,
            '-B',
            dbBackupList.join(" ")
        ])

        // create file data streaming
        const writeStream = fs.createWriteStream(dumpFilePath);

        // launch backup command
        dumpCmd
            .stdout
            .pipe(writeStream)
            .on('finish', function () {
                console.log('Backup successfully created as file ' + dumpFilePath);
                // pass filepath to callback
                callback(null, dumpFilePath);
            })
            .on('error', function (err) {
                console.log(err);
                // send error to callback
                callback(err, null);
            })
    }
    else
    {
        let err = "Root Password not correct!";
        console.log(err);
        // send error to callback
        callback(err, null);
    }

  };
