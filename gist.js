"use strict";
var request = require('request');
var https = require('https');
var url = require('url');

/* Act on 'data' and 'end' events from getDetails to build object and resolve 
   or reject promise accordingly. */
function onResponse(response, resolve, reject) {
    var hasResponseFailed = response.status >= 400;
   
    if (hasResponseFailed) {
        reject(`Request to ${response.url} failed.`);
    }

    var chunkedBody = [];
		response.on('data', function (d) {
		    chunkedBody.push(d);
		   
		  });

		response.on('end', function() {
		  	var body = Buffer.concat(chunkedBody);
		    var details = JSON.parse(body);
		    resolve(details);

		  });
}

/* Create promise for getting gist detail. A promise is important here so that we 
   don't do final processing and callback until all details are fetched. */
function getDetails(urlString) {
	return new Promise(function(resolve, reject) {
    	// must extract parts from full url.
    	var urlParts = url.parse(urlString);
        var requestOptions = { hostname: urlParts.hostname,
            					 path: urlParts.path,
				        		 headers: {
					    		    	'User-Agent': 'david.andrawis@gmail.com'
					    		   }
					    		};

		var request = https.get(requestOptions, function (res) {
			onResponse(res, resolve, reject)
		});

        request.on('error', reject);
    });
}

/* Call https get and return all gists for single user. This should use the promise method 
   such that code can be combined with detail get, and for consistency. */
function getGists(username, callback) {

	var options = {
	   	host: 'api.github.com',
	   	path:'/users/'+username+'/gists',
       	headers: {
    		'User-Agent': 'david.andrawis@gmail.com'
    		}
		};

	var req = https.get(options, function(result) {
	  
		var chunkedBody = [];
		result.on('data', function (d) {
		    chunkedBody.push(d);
		   
		  });

		result.on('end', function() {
		  	var body = Buffer.concat(chunkedBody);
		    var parsed = JSON.parse(body);
		    if (parsed && parsed.length > 0) {
			    var resultList = [];
				for (let value of parsed) {
				  resultList.push(value);
				}
			}

			callback(null, resultList);

		  });

	});

	req.on('error', function(e) {
    	// pass up error
    	callback(e, null);
    	console.error(e);
      });
}

/* Only exported method. Return gists matching regex pattern for user.
   If pattern is not provided, results are not filtered. */

exports.searchGists = function(username, pattern, callback) {
	var allGists;

	// we should pass flags (g/i/etc.) from the ui..
	var regexObj = new RegExp(pattern, 'g');

	function filterBy(valueObject, index, array) {
		// this function searches objects for strings matching the regexp
		if (valueObject !== null && typeof valueObject === 'object') {
		  	// if value is object, call recursively on child properties.
		  	var found = false;
		  	for (var propertyName in valueObject) {

		  		found = found || filterBy(valueObject[propertyName]);
		   		
				if (found) {
					return found;
				}
			}
		} else if (valueObject !== null && typeof valueObject === 'string' && regexObj.test(valueObject)) {
			// else return true if value is string and matches pattern.
			return true;
		} 
		
		// else value is non-string (or doesn't match)
		return false;
	}

	getGists(username, function(e, d) {
		if (e) {
			callback(e, null);
		} else {
			allGists = d;

			
			if (allGists) {
				// If there is pattern, get details and search on pattern.
				if (pattern) {
					var promises = allGists.map(obj => getDetails(obj.url));
					
					Promise.all(promises).then(function(responses) {
						// filter responses by pattern. */
						responses = responses.filter(filterBy);

						// only return url's 
						responses = responses.map( obj => obj.html_url);
						callback(null, responses);
					    
					});
				} 
				// otherwise return all urls.
				else {
					allGists = allGists.map(obj => obj.html_url);
					callback(null, allGists);
				}
			}
		}
	});

}


