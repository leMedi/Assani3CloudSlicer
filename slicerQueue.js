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