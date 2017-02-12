angular.module('gistsApp').factory('GistsService', ['$http', function($http) {
	return {
		getGists: function(username, pattern, callback) {
			$http.post("/search/", {"user": username, "pattern": pattern})
			    .then(function(response) {
			       callback(response.data);
			    }, function(response) {
			       callback(0);
			    });
		}
	}	
}]);
  

