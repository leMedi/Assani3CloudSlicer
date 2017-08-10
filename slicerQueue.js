var path = require('path');
var exec = require('child_process').exec;

var slic3rPath = path.join(__dirname, "./bin/Slic3r/slic3r-console.exe");


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