angular.module('demonApp', ['widget.scrollbar'])
.controller('demonController', ['$scope', function($scope) {

	$scope.items = [];

	(function($scope) {
		for(var i = 0; i < 20; i++) {
			$scope.items.push({
				id: i,
				name: 'item' + i,
				introduction: 'welcome to use the ngScrollbar directive and give some feedback'
			});
		}
	})($scope);

	$scope.addItem = function() {
		var index = $scope.items.length;
		$scope.items.push({
			id: index,
			name: 'item' + index,
			introduction: 'welcome to use the ngScrollbar directive and give some feedback'
		});
	};

	$scope.removeItem = function() {
		$scope.items.pop();
	};

	// $scope.scrollbarConfig = function(directive, autoResize, show) {
	// 	config.direction = direction;
 //        config.autoResize = autoResize;
 //        config.scrollbar = {
 //            show: !!show
 //        };
 //        return config;
	// }
}]);