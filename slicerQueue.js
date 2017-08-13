var slicer = require('./slicer'),
    kue = require('kue'),
    queue = require('kue').createQueue();

var redis = require("redis"),
    client = redis.createClient();

////////////////////////////////////
////// Settings
////////////////////////////////////
var concurrency = 10, // max active jobs 
    timeToLive = 5*60*60*1000; // five hours

// KueJs process
queue.process('slice', concurrency, function (job, done) {  
    slicer(job.data.id, function (fileId, fileInfo) {
        console.log("done slicing " + job.data.title);
        client.hset(job.data.id, "estimatedTime", fileInfo.estimatedTime);
        client.hset(job.data.id, "estimatedFilamentLength", fileInfo.estimatedFilamentLength);
        client.hset(job.data.id, "dimX", fileInfo.Dimensions.X);
        client.hset(job.data.id, "dimY", fileInfo.Dimensions.Y);
        client.hset(job.data.id, "dimZ", fileInfo.Dimensions.Z);
        client.hset(job.data.id, "estimatedWeight", fileInfo.estimatedWeight);
        done();
    });
});

var SlicerQueue = {};

SlicerQueue.checkJobStatus = function (jobId, callback) {
    kue.Job.get(jobId, callback);
};

SlicerQueue.createJob = function(data, callback) {

    var job = queue.create('slice', data).ttl(timeToLive).save(
        function (err) {
            callback(job, err);
        }
    );
    
    job
        .on('complete', function(){
            console.log('Job ' + data.title + '(' + job.id + ') completed');
        })
        .on('failed', function() {
            console.log('Job ' + data.title + '(' + job.id + ') failed');
        });

};

module.exports = SlicerQueue;