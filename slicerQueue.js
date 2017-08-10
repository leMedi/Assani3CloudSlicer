var path = require('path');
var exec = require('child_process').exec;

var slic3rPath = path.join(__dirname, "./bin/Slic3r/slic3r-console.exe");
var gcoderPath = path.join(__dirname, "./bin/gcoder.py");


function runSlic3r(stlFileId, config, callback, errorCb) {
    
    var stlFile = path.join(__dirname, "/uploads/" + stlFileId +  ".stl");
    var gcodeFile = path.join(__dirname, "/outputs/" + stlFileId +  ".gcode"); // generate path for .gcode file
    var configFile = path.join(__dirname, "/configs/" + config +  ".ini");
    
	// slic3r command: slic3r example.stl --load example.ini --output example.gcode 
    var command = slic3rPath + " " + stlFile + " --load " + configFile + " --output " + gcodeFile; // silce .stl using slic3r

	exec(command,function(error, stdout, stderr){
		if (error) {
            errorCb(stlFileId, error);
        }else
            callback(stlFileId);
	});
}

function runGcoder(gcodeFileId, callback, errorCb) {
    var exec = require('child_process').exec;
    
    var gcodeFile = path.join(__dirname, "/outputs/" + gcodeFileId +  ".gcode"); // generate path for .gcode file
    
	var command = "python  " + gcoderPath + " " + gcodeFile;

	exec(command,function(error, stdout, stderr){
		if (error) {
            console.log(error);
            //errorCb(error);
		}else
		    callback(stdout); // todo: parse gcoder.py output
	});
}

