var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var SlicerQueue = require('./SlicerQueue');

var redis = require("redis"),
    client = redis.createClient();


var slicerRouter = express.Router();

// test route
slicerRouter.route('/').get(function (req, res) {
    res.json({ message: 'A cool api :)' });  
});

slicerRouter.route('/upload/:email').post(function(req, res){
    var form = new formidable.IncomingForm();

    form.multiples = true;  // allow user to upload files

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    form.on('file', function(field, file) {
        
        // give it a random name
        var newRandomName = new Date().getTime().toString(16);
        fs.rename(file.path, path.join(form.uploadDir, newRandomName + '.stl'));

        
        // start slicing job
        SlicerQueue.createJob({
            id: newRandomName,
            title: file.name, // original file name
            ownerEmail: req.params.email
        }, function (job, err) {
            if(err){
                res.status(503).json({ message: process.env.STARTING_JOB_ERR, error: err});
            }
            else{
                client.hset(newRandomName, 'jobId', job.id);
                res.json({ message: process.env.JOB_STARTED, id: newRandomName});
            }
        });

    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log(err);
        res.status(400).json({ message: process.env.STARTING_JOB_ERR, error: err});
    });

    // once all the files have been uploaded
    // form.on('end', function() { });

    if(validateEmail(req.params.email))
        form.parse(req);    // parse the incoming request
    else
        res.status(400).json({ message: process.env.INVALID_EMAIL, error: 'email not valid'});
                      
});

slicerRouter.route('/status/:jobId').get(function (req, res) {
    console.log(req.params.jobId);
    client.hgetall(req.params.jobId, function(err, job) {
        if (err || job === null) {
            res.status(404).json({ message: process.env.INVALID_JOB_ID, error: err});
        } else {
            res.json({ data: job });
        }
    });
});

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = slicerRouter;