angular.module('gistsApp').controller('GistsController', ['$scope', 'GistsService',
	function($scope, GistsService) {

		$scope.searchUsername = '';

		$scope.searchPattern = '';

		$scope.searchStatus = null;

		$scope.results = null;

		$scope.username = '';

		$scope.pattern = '';

		$scope.doSearch = function() {
			
			var ret;

			$scope.searchStatus = 'search';
			$scope.results = [];
			
			GistsService.getGists($scope.username, $scope.pattern, function(d) {
				ret = d;

				if (ret) {
					$scope.searchStatus = ret.status;
					$scope.searchUsername = ret.username;
					$scope.searchPattern = ret.pattern;

					$scope.results = ret.matches;
				}
			});
			
		};


 

}]);