var path = require('path');
var exec = require('child_process').exec;

var slic3rPath = path.join(__dirname, "./bin/Slic3r/slic3r-console.exe");
var gcoderPath = path.join(__dirname, "./bin/gcoder.py");

function slice(Id) {
    runSlic3r(Id, "1", function (stlFileId) {
        runGcoder(stlFileId, function(stdout) {
            var fileInfo = parseGcoderOutput(stdout);
        });
    });
}

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

function parseGcoderOutput(gcoderOutput){
	var Output = {
        Dimensions: {
            X: 0,
            Y: 0,
            Z: 0
        }
	};

	lines = gcoderOutput.split("\n");

	Output.estimatedTime = lines[9].substr(20); // get estimated print time
	Output.estimatedFilamentLength = lines[7].slice(3,lines[7].length-2); // get estimated filament to be used for printing object
	Dimensions.X = lines[3].slice(lines[3].indexOf("(")+1, lines[3].indexOf(")")); 
	Dimensions.Y = lines[4].slice(lines[4].indexOf("(")+1, lines[4].indexOf(")")); 
	Dimensions.Z = lines[5].slice(lines[5].indexOf("(")+1, lines[5].indexOf(")")); 

    return Output;
	// callback(estimatedTime, estimatedFilamentLength, Dimensions);
}