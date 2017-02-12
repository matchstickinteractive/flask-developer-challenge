
"use strict";
var express = require("express");

var app = express();

app.use(express.static(__dirname + '/ui')); 

var routes = require("./routes.js")(app);

app.get('', function(req, res) {
        res.sendFile('./ui/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
var server = app.listen(8081, function () {
    console.log("Listening on port %s...", server.address().port);
});