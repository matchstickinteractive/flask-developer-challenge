
"use strict";

var gist = require("./gist.js");
var bodyParser = require("body-parser");


var appRouter = function(app) {
	app.use( bodyParser.json() );     
	
	app.get("/ping", function(req, res) {
	    res.send("pong");
	});

	app.post("/search", function(req, res) {

		var username = req.body.user;
		var pattern = req.body.pattern;

		// default return value. 
		var returnVal = {'status': 'success', 
	                     	'username': username,
	                     	'pattern': pattern,
	                     	'matches': []
						};

		gist.searchGists(username, pattern, function(error, resList) {
			// I am really only handling errors generated by the initial get for 
			// gists summary listing. 
			if (error) {
				returnVal.status = "fail";
			} else if (resList) {
				returnVal.matches = resList;
			}
			res.send(returnVal);
		});

	});
}
 
module.exports = appRouter;