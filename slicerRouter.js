var express = require('express');
var app = express();
var slicerRouter = express.Router();

// test route
slicerRouter.route('/').get(function (req, res) {
    res.json({ message: 'A cool api :)' });  
});


module.exports = slicerRouter;