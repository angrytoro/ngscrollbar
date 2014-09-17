/**
 * Created by marvinp
 * Date: 9/12/2014
 * Time: 1:48 PM
 */

// todo 先处理垂直方向
angular.module('widget.scrollbar', [])
.directive('ngScrollbar', ['$timeout',
	function($timeout) {
		return {
			restrict: 'AE',
			transclude: true,
			scope: {
				scrollbarConfig: '=scrollbarConfig',
				scrollbarX: '@',
				scrollbarY: '@'
			},
			template: '<div style="position:relative;width:100%;height:100%;">\
							<div class="ngscroll-content-container" style="position:absolute;top:0;left:0;transition: top .4s linear, left .4s linear;" ng-transclude>\
							</div>\
					   		<ng-scrollbar-x ng-if="scrollbarX || scrollbarX === undefined"></ng-scrollbar-x>\
					   		<ng-scrollbar-y ng-if="scrollbarY || scrollbarY === undefined"></ng-scrollbar-y>\
					   </div>',
			controller: 'scrollbarController',
			compile: function(element, attrs) {
				element.css('overflow', 'hidden');
				console.log('ngScrollbar compile');
				return function(scope, element, attrs, ctrl) {
					console.log('ngScrollbar link');
					var defaultConfig = {
						dragSpeed: 1, //default browser delta value is 120 or -120
						firefoxDragSpeed: 40, // the ff delta value is 3 or -120 when scroll
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

					var config = angular.copy(angular.extend(scope.scrollbarConfig || {}, defaultConfig)), //if don't use copy the config will be the default value of scope.scrollbarConfig
						contentElement = angular.element(element[0].querySelector('.ngscroll-content-container')),
						contentDom = contentElement[0],
						scrollbarMargin = (config.scrollbarContainer.width - config.scrollbar.width) / 2,
						scrollbarHoverMargin = (config.scrollbarContainer.width - config.scrollbar.hoverWidth) / 2;

					angular.extend(ctrl, {
						getContainerElement: function() {
							return element;
						},
						getContentElement: function() {
							return contentElement;
						},
						getConfig: function() {
							return config;
						},
						getScrollbarMargin: function() {
							return scrollbarMargin;
						},
						getScrollbarHoverMargin: function() {
							return scrollbarHoverMargin;
						}
					});
				};
			}
		};
	}
])
.controller('scrollbarController', ['$scope', function($scope) {
	console.log('scrollbarController');
	// console.log($scope);
}])
.directive('ngScrollbarY', ['$timeout', function($timeout){
	return {
		restrict: 'AE',
		require: '^ngScrollbar',
		replace: true,
		template: '<div class="ngscrollbar-container-y" ng-style="styles.scrollbarContainer"><div class="ngscrollbar-y" ng-style="styles.scrollbar"></div></div>',
		compile: function(element, attrs) {
			console.log('ngScrollbarY compile');
			return function(scope, element, attrs, ctrl) {
				console.log('ngScrollbarY link');

				var config = ctrl.getConfig(),
					docEl = angular.element(document),
					containerElement = ctrl.getContainerElement(),
					containerDom = containerElement[0],
					contentElement = ctrl.getContentElement(), //the container of content
					scrollbarContainer = angular.element(containerDom.querySelector('.ngscrollbar-container-y')),
					scrollbar = angular.element(containerDom.querySelector('.ngscrollbar-y')),
					scrollbarMargin = ctrl.getScrollbarMargin(),
					scrollbarHoverMargin = ctrl.getScrollbarHoverMargin();
					// containerHeight = element[0].offsetHeight, // the element which need to mock scrollbar;
					// containerMaxHeight = element[0].style.maxHeight;

				scope.styles = {
					scrollbarContainer: {
						position: 'absolute',
						height: '100%',
						transition: 'background .3s ease-in-out',
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

				var getContentHeight = function() {
					return contentElement[0].offsetHeight;
				};

				var getContainerHeight = function() {
					return containerElement[0].offsetHeight;
				};

				var getScrollbarHeight = function() {
					var height = Math.pow(getContainerHeight(), 2) / contentElement[0].offsetHeight - scrollbarMargin*2;
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
					contentElement.css('top', top + 'px');
					scrollbar.css('top', -top/getContentHeight()*getContainerHeight() + scrollbarMargin + 'px');
				};

				var scroll = function(distance) {
					var newTop = parseInt(contentElement.css('top'), 10) + distance;
					scrollTo(newTop);
				};

				containerElement.on('mousewheel', function(event) {
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
					containerElement.on('wheel', function(event) {
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

				var scrollbarMousedown = false,
					axisY,
					mouseInElement = false;

				containerElement.on('mouseenter', function(event) {
					mouseInElement = true;
					showScrollbar();
				});
				containerElement.on('mouseleave', function(event) {
					mouseInElement = false;
					if (scrollbarMousedown) {
						return;
					}
					hideScrollbar();
				});

				scrollbar.on('mousedown', function(event) {
					event.preventDefault();
					scrollbarMousedown = true;
					axisY = event.screenY;
					docEl.one('mouseup', function(event) {
						scrollbarMousedown = false;
						if (!mouseInElement) {
							hideScrollbar();
						}
						// docEl.off('mouseup', arguments.callee);
					});
				});
				docEl.on('mousemove', function(event) {
					if(scrollbarMousedown) {
						event.preventDefault();
						scroll(-(event.screenY - axisY) * config.dragSpeed * getContentHeight() / getContainerHeight());
						axisY = event.screenY;
					}
				});

				$timeout(reset,5);
			}
		}
	};
}])
.directive('ngScrollbarX', ['$timeout', function($timeout) {
	return {
		restrict: 'AE',
		replace: true,
		require: '^ngScrollbar',
		template: '<div class="ngscrollbar-container-x" ng-style="styles.scrollbarContainer"><div class="ngscrollbar-x" ng-style="styles.scrollbar"></div></div>',
		compile: function(element, attrs) {
			return function(scope, element, attrs, ctrl) {

				var config = ctrl.getConfig(),
					docEl = angular.element(document),
					containerElement = ctrl.getContainerElement(),
					containerDom = containerElement[0],
					contentElement = ctrl.getContentElement(), //the container of content
					// scrollbarContainer = angular.element(containerDom.querySelector('.ngscrollbar-container-x')),
					scrollbar = angular.element(element[0].querySelector('.ngscrollbar-x')),
					scrollbarMargin = ctrl.getScrollbarMargin(),
					scrollbarHoverMargin = ctrl.getScrollbarHoverMargin();
					// containerHeight = element[0].offsetHeight, // the element which need to mock scrollbar;
					// containerMaxHeight = element[0].style.maxHeight;

				scope.styles = {
					scrollbarContainer: {
						position: 'absolute',
						width: '100%',
						transition: 'background .3s ease-in-out',
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

				element.css('height', config.scrollbarContainer.width + 'px'); // set the scrollbarContainer height;
				// scrollbarContainer.css('height', '100%');
				element.css('bottom', 0); // set scrollbarContainer top
				element.css('left', 0); //set scrollbarContainer left
				scrollbar.css('top', scrollbarMargin + 'px'); //set scrollbar top
				scrollbar.css('height', config.scrollbar.width + 'px');

				var getContentWidth = function() {
					return contentElement[0].offsetWidth;
				};

				var getContainerWidth = function() {
					return containerDom.offsetWidth;
				};

				var getScrollbarWidth = function() {
					return Math.pow(getContainerWidth(), 2) / getContentWidth() - scrollbarMargin * 2;
				};

				var showScrollbar = function() {
					scrollbar.css('opacity', 1);
				};

				var hideScrollbar = function() {
					scrollbar.css('opacity', 0);
				};

				var isOverflow = function() {
					return getContentWidth() > getContainerWidth();
				};

				var reset = function() {
					if (isOverflow()) {
						element.css('display', 'block');
						scrollbar.css('left', scrollbarMargin + 'px');
						scrollbar.css('width', getScrollbarWidth() + 'px');
					} else {
						element.css('display', 'none');
					}
				};

				var scrollTo = function(left) {
					left = Math.min(0, Math.max(left, getContainerWidth() - getContentWidth()));
					contentElement.css('left', left + 'px');
					scrollbar.css('left', -left/getContentWidth()*getContainerWidth() + scrollbarMargin + 'px');
				};

				var scroll = function(distance) {
					var left = parseInt(contentElement.css('left'), 10) + distance;
					scrollTo(left);
				};

				element.on('mouseenter', function(event) {
					element.css('background', config.scrollbarContainer.color);
					scrollbar.css('height', config.scrollbar.hoverWidth + 'px');
					scrollbar.css('top', scrollbarHoverMargin + 'px');
					scrollbar.css('border-radius', config.scrollbar.hoverWidth / 2 + 'px');
				});

				element.on('mouseleave', function(event) {
					element.css('background', 'none');
					scrollbar.css('height', config.scrollbar.width + 'px');
					scrollbar.css('top', scrollbarMargin + 'px');
					scrollbar.css('border-radius', config.scrollbar.width / 2 + 'px');
				});

				var scrollbarMousedown = false,
					axisX,
					mouseInElement = false;

				containerElement.on('mouseenter', function(event) {
					mouseInElement = true;
					showScrollbar();
				});
				containerElement.on('mouseleave', function(event) {
					mouseInElement = false;
					if (scrollbarMousedown) {
						return;
					}
					hideScrollbar();
				});

				scrollbar.on('mousedown', function(event) {
					event.preventDefault();
					scrollbarMousedown = true;
					axisX = event.screenX;
					docEl.one('mouseup', function(event) {
						scrollbarMousedown = false;
						if (!mouseInElement) {
							hideScrollbar();
						}
						// docEl.off('mouseup', arguments.callee);
					});
				});
				docEl.on('mousemove', function(event) {
					if(scrollbarMousedown) {
						event.preventDefault();
						scroll(-(event.screenX - axisX) * config.dragSpeed * getContentWidth() / getContainerWidth());
						axisX = event.screenX;
					}
				});

				$timeout(reset,5);
			};
		}
	}
}]);