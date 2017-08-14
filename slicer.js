var path = require('path');
var exec = require('child_process').exec;

var slic3rPath = path.join(__dirname, './bin/Slic3r/slic3r-console.exe');
var gcoderPath = path.join(__dirname, './bin/gcoder.py');

function slice(Id, callback) {
    runSlic3r(Id, '1', function (error, stlFileId) {
		if(error)
			callback(error);
		else
			runGcoder(stlFileId, function(error, stdout) {
				if(error)
					callback(error);
				else{
					var fileInfo = parseGcoderOutput(stdout);
					fileInfo.estimatedWeight = calculateWeight(fileInfo.estimatedFilamentLength);
					
					callback(false, Id, fileInfo);
				}
			});
    });
}

function runSlic3r(stlFileId, config, callback) {
    
    var stlFile = path.join(__dirname, '/uploads/' + stlFileId +  '.stl');
    var gcodeFile = path.join(__dirname, '/outputs/' + stlFileId +  '.gcode'); // generate path for .gcode file
    var configFile = path.join(__dirname, '/configs/' + config +  '.ini');
    
	// slic3r command: slic3r example.stl --load example.ini --output example.gcode 
    var command = slic3rPath + ' ' + stlFile + ' --load ' + configFile + ' --output ' + gcodeFile; // silce .stl using slic3r

	exec(command,function(error, stdout, stderr){
		if (error)
			callback(error);
        else
            callback(false, stlFileId);
	});
}

function runGcoder(gcodeFileId, callback, errorCb) {
    var exec = require('child_process').exec;
    
    var gcodeFile = path.join(__dirname, '/outputs/' + gcodeFileId +  '.gcode'); // generate path for .gcode file
    
	var command = 'python  ' + gcoderPath + " " + gcodeFile;

	exec(command,function(error, stdout, stderr){
		if (error)
			callback(error);
		else
		    callback(false, stdout);
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

	lines = gcoderOutput.split('\n');

	Output.estimatedTime = lines[9].substr(20); // get estimated print time
	Output.estimatedFilamentLength = parseInt(lines[7].slice(3,lines[7].length-2)); // get estimated filament to be used for printing object
	Output.Dimensions.X = lines[3].slice(lines[3].indexOf('(')+1, lines[3].indexOf(')')); 
	Output.Dimensions.Y = lines[4].slice(lines[4].indexOf('(')+1, lines[4].indexOf(')')); 
	Output.Dimensions.Z = lines[5].slice(lines[5].indexOf('(')+1, lines[5].indexOf(')')); 

    return Output;
}

// get density for plastic used to print the object
function getDensity(fillType){ // en g/cm3 (metric system is cool)
	fillType = fillType.toString().toUpperCase();
	switch(fillType){
		case 'ABS':
			return 1.4;
		case 'PLA':
			return 1.25;
	}
}

function calculateWeight(fillLength, fillDiameter, fillType){ // en g

	// default values
    var fillDiameter = typeof fillDiameter !== 'undefined' ?  parseInt(fillDiameter) : 1.75; // most of the printers we have, use fillament of this diametre
	var fillType = typeof fillType !== 'undefined' ?  fillType : 'ABS';

	var fillradius = fillDiameter/2,
		section = fillradius * fillradius * Math.PI,
		volume = section * fillLength; // in mm3

	var volumeCmCube = volume * 0.001; // convert volume to cm3

	return volumeCmCube * getDensity(fillType); // weight in g
}

module.exports = slice; 