var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');


var slicerRouter = express.Router();

// test route
slicerRouter.route('/').get(function (req, res) {
    res.json({ message: 'A cool api :)' });  
});

slicerRouter.route('/upload').post(function(req, res){
    var form = new formidable.IncomingForm();

    form.multiples = true;         // allow user to upload files

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name));
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log(err);
        res.json({ message: 'An error has occured: ' + err });
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.json({ message: 'File Uploaded Successfully.'});
    });

     form.parse(req);               // parse the incoming request
});

module.exports = slicerRouter;