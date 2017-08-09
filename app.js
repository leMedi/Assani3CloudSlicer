// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express

var port = process.env.PORT || 8080;        // set our port


// test route to make sure everything is working (accessed at GET http://localhost:8080/)
app.get('/', function(req, res) {
    res.json({ message: 'Hello World :)' });   
});


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
