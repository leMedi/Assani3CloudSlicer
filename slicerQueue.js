var slicer = require('./slicer'),
    kue = require('kue'),
    queue = require('kue').createQueue();


////////////////////////////////////
////// Settings
////////////////////////////////////
var concurrency = 10, // max active jobs 
    timeToLive = 5*60*60*1000; // five hours

// KueJs process
queue.process('slice', concurrency, function (job, done) {  
    slicer(job.data.id, function (fileId, fileInfo) {
        console.log("done slicing " + job.data.title);
        job.info = fileInfo;
        done();
    });
});

var SlicerQueue = {};

SlicerQueue.check_job_status = function (job_id) {
    kue.Job.get(job_id, function(err, job){
        if (err) console.log("job " + job_id + " status: Error");
        else console.log("job " + job_id + " status: " + job.state());
    });
};

SlicerQueue.create_job = function(data, callback) {

    var job = queue.create('slice', data).ttl(10 * 1000).ttl(timeToLive).save(
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