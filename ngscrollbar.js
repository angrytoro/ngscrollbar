/**
 * Created by marvinp
 * Date: 9/12/2014
 * Time: 1:48 PM
 */

// todo 先处理垂直方向
angular.module('widget.scrollbar', [])
.directive('ngScrollbar', ['$timeout',function($timeout) {
	return {
		restrict: 'AE',
		transclude: true,
		scope: {
			repeatItems: '=repeatItems', // the attribute is used to watch if the content is changed.
			scrollbarConfig: '@'
		},
		template: '<div style="position:relative;width:100%;height:100%;">\
					<div class="ngscroll-content-container" style="position:absolute;width:100%;top:0;transition: top .4s linear;" ng-transclude>\
					</div>\
			   		<div class="ngscrollbar-container" ng-style="styles.scrollbarContainer"><div class="ngscrollbar" ng-style="styles.scrollbar"></div>\
			   		</div>\
			   </div>',
		controller: 'scrollbarController',
		compile: function(element, attrs) {
			element.css('overflow', 'hidden');
			return function($scope, element, attrs, ctrl) {
				var config = {
					autoResize: true,
					direction: 'vertical',
					dragSpeed: 1, //default browser delta value is 120 or -120
					firefoxDragSpeed: 40, // the ff delta value is 3 or -120 when scroll
					scrollTo: null,
					scrollbar: {
						width: 6,
						hoverWidth: 8,
						color: 'rgba(0,0,0,.6)'
					},
					scrollbarContainer: {
						width: 12,
						color: 'rgba(0,0,0,.1)'
					}
				};

				angular.extend(config, $scope.scrollbarConfig || {});

				var docEl = angular.element(document);
					elDom = element[0];
					contentContainer = angular.element(elDom.querySelector('.ngscroll-content-container')), //the container of content
					scrollbarContainer = angular.element(elDom.querySelector('.ngscrollbar-container')),
					scrollbar = angular.element(elDom.querySelector('.ngscrollbar')),
					scrollbarMargin = (config.scrollbarContainer.width - config.scrollbar.width) / 2,
					scrollbarHoverMargin = (config.scrollbarContainer.width - config.scrollbar.hoverWidth) / 2;
					// containerHeight = element[0].offsetHeight, // the element which need to mock scrollbar;
					// containerMaxHeight = element[0].style.maxHeight;

				$scope.styles = {
					scrollbarContainer: {
						position: 'absolute',
						height: '100%',
						transition: 'background .3s ease-in-out',
						// background: config.scrollbarContainer.color,
						'border-radius': config.scrollbarContainer.width / 2 + 'px'
					},
					scrollbar: {
						position: 'absolute',
						cursor: 'default',
						opacity: 0,
						transition: 'opacity .3s ease-in-out, border-radius .1s linear, width .1s linear, right .1s linear',
						background: config.scrollbar.color,
						'border-radius': config.scrollbar.width / 2 + 'px'
					}
				};

				scrollbarContainer.css('width', config.scrollbarContainer.width + 'px'); // set the scrollbarContainer width;
				// scrollbarContainer.css('height', '100%');
				scrollbarContainer.css('top', 0); // set scrollbarContainer top
				scrollbarContainer.css('right', 0); //set scrollbarContainer right
				scrollbar.css('right', scrollbarMargin + 'px'); //set scrollbar right
				scrollbar.css('width', config.scrollbar.width + 'px');

				if ($scope.repeatItems) {
					$scope.$watch('repeatItems', function() { // when the content is changed.
						$timeout(reset, 5);
					});
				}

				var getContentHeight = function() {
					return contentContainer[0].offsetHeight;
				};

				var getContainerHeight = function() {
					return element[0].offsetHeight;
				};

				var getScrollbarHeight = function() {
					var height = Math.pow(getContainerHeight(), 2) / contentContainer[0].offsetHeight - scrollbarMargin*2;
					return height;
				};

				var isOverflow = function() {
					// return containerMaxHeight && parseInt(containerMaxHeight, 10) >= getContentHeight() || getContentHeight() > getContainerHeight();
					return getContentHeight() > getContainerHeight();
				};

				var hideScrollbar = function() {
					scrollbar.css('opacity', 0);
				};

				var showScrollbar = function() {
					scrollbar.css('opacity', 1);
				}

				var reset = function() {
					if (isOverflow()) {
						scrollbarContainer.css('display', 'block');
						scrollbar.css('top', scrollbarMargin + 'px'); // set scrollbar top
						scrollbar.css('height', getScrollbarHeight() + 'px');
					} else {
						scrollbarContainer.css('display', 'none');
					}
				};

				var scrollTo = function(top) {
					top = Math.min(0, Math.max(top, getContainerHeight() - getContentHeight()));
					contentContainer.css('top', top + 'px');
					scrollbar.css('top', -top/getContentHeight()*getContainerHeight() + scrollbarMargin + 'px');
				};

				var scroll = function(distance) {
					var newTop = parseInt(contentContainer.css('top'), 10) + distance;
					scrollTo(newTop);
				};

				element.on('mousewheel', function(event) {
					if (!isOverflow()) {
						return;
					}
					event.preventDefault();
					if (event.originalEvent !== undefined) {
						event = event.originalEvent;
					}
					scroll(event.wheelDeltaY || event.wheelDelta);
				});

				if(window.navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
					element.on('wheel', function(event) {
						if (!isOverflow()) {
							return;
						}
						event.preventDefault();
						if (event.originalEvent !== undefined) {
							event = event.originalEvent;
						}
						scroll(-event.deltaY * config.firefoxDragSpeed);
					});
				}

				scrollbarContainer.on('mouseenter', function(event) {
					scrollbarContainer.css('background', config.scrollbarContainer.color);
					scrollbar.css('width', config.scrollbar.hoverWidth + 'px');
					scrollbar.css('right', scrollbarHoverMargin + 'px');
					scrollbar.css('border-radius', config.scrollbar.hoverWidth / 2 + 'px');
				});

				scrollbarContainer.on('mouseleave', function(event) {
					scrollbarContainer.css('background', 'none');
					scrollbar.css('width', config.scrollbar.width + 'px');
					scrollbar.css('right', scrollbarMargin + 'px');
					scrollbar.css('border-radius', config.scrollbar.width / 2 + 'px');
				});

				element.on('mouseenter', function(event) {
					showScrollbar();
				});
				element.on('mouseleave', function(event) {
					if (scrollbarMousedown) {
						return;
					}
					hideScrollbar();
				});

				var scrollbarMousedown = false,
					coordY;
				scrollbar.on('mousedown', function(event) {
					event.preventDefault();
					scrollbarMousedown = true;
					coordY = event.screenY;
					docEl.one('mouseup', function(event) {
						scrollbarMousedown = false;
						hideScrollbar();
						// docEl.off('mouseup', arguments.callee);
					});
				});
				docEl.on('mousemove', function(event) {
					if(scrollbarMousedown) {
						event.preventDefault();
						scroll(-(event.screenY - coordY) * config.dragSpeed * getContentHeight() / getContainerHeight());
						coordY = event.screenY;
					}
				});

				$timeout(reset,5);
			};
		}
	};
}])
.controller('scrollbarController', ['$scope',
	function($scope) {
		console.log($scope);
	}
]);