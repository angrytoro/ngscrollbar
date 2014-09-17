/**
 * @name ng-scrollbar
 * @author angrytoro
 * @since 9/12/2014
 * @version 0.1
 * @see https://github.com/angrytoro/ngscrollbar
 * @copyright 2014 angrytoro
 * @license MIT: You are free to use and modify this code for any use, on the condition that this copyright notice remains.
 *
 * The angular directive ng-scrollbar imitate the true browser scrollbar.
 * It's applied to the element which set height or width attribute and the overflow is auto, but exclude body element.
 * It's not necessary to imitate scrollbar for body element, if you use the AngularJS.
 * suggests: don't use the directive, if you don't have to. The scrollbar which is inbuilt in browser is more highly-efficient.
 *
 * @todo find a solution to reset the scrollbar when the content is changed;
 */


angular.module('widget.scrollbar', [])
.directive('ngScrollbar', ['$timeout',
	function($timeout) {
		return {
			restrict: 'AE',
			transclude: true,
			scope: {
				scrollbarConfig: '=scrollbarConfig',
				scrollbarX: '@', // the value is true or false, to configure the x scrollbar create or no create.
				scrollbarY: '@' // the value is true or false, to configure the y scrollbar create or no create.
			},
			template: '<div style="position:relative;width:100%;height:100%;">\
							<div class="ngscroll-content-container" style="position:absolute;top:0;left:0;" ng-transclude>\
							</div>\
					   		<ng-scrollbar-x ng-if="scrollbarX || scrollbarX === undefined"></ng-scrollbar-x>\
					   		<ng-scrollbar-y ng-if="scrollbarY || scrollbarY === undefined"></ng-scrollbar-y>\
					   </div>',
			controller: 'scrollbarController',
			compile: function(element, attrs) {
				element.css('overflow', 'hidden');
				console.log('ngScrollbar compile');
				return function(scope, element, attrs, ctrl) {
					ctrl.init(element, scope.scrollbarConfig);
					
				};
			}
		};
	}
])
.controller('scrollbarController', ['$scope', function($scope) {
	console.log('scrollbarController');

	var defaultConfig = {
		dragSpeed: 1, //default browser delta value is 120 or -120
		autoResize: false, // if need auto resize, default false
		show: false, // if need show when mouse not enter the container element which need scrollbar, default false.
		scrollbar: {
			width: 6, //scrollbar width
			hoverWidth: 8, //scrollbar width when the mouse hover on it 
			color: 'rgba(0,0,0,.6)' //scrollbar background color
		},
		scrollbarContainer: {
			width: 12, //scrollbarContainer width 
			color: 'rgba(0,0,0,.1)' // scrollbarContainer background 
		}
	};
	var containerElement, // the element which need the directive of ngscrollbar
		contentElement, // the element which transclude the true content
		config, // config
		scrollbarMargin, // the variable is used to descide the scrollbar element top or left to its parent element scrollbarContainer
		ScrollbarHoverMargin; // the variable is used to descide the scrollbar element top or left to its parent element scrollbarContainer when the mouse hover on the scrollbar

	/**
	 * it must be called before the controller is used.
	 * @param  {jqlite object} element         it's necessary variable
	 * @param  {object} scrollbarConfig        the config which is defined by user
	 * @return                 
	 */
	this.init = function(element, scrollbarConfig) {
		containerElement = element;
		config = angular.copy(angular.extend(scrollbarConfig || {}, defaultConfig));
		contentElement = angular.element(element[0].querySelector('.ngscroll-content-container'));
		scrollbarMargin = (config.scrollbarContainer.width - config.scrollbar.width) / 2;
		scrollbarHoverMargin = (config.scrollbarContainer.width - config.scrollbar.hoverWidth) / 2;
	};

	angular.extend(this, {
		/**
		 * get the element which need the directive of ngscrollbar
		 * @return {jqlite object} 
		 */
		getContainerElement: function() {
			return containerElement;
		},
		/**
		 * the element which transclude the true content
		 * @return {jqlite object}
		 */
		getContentElement: function() {
			return contentElement;
		},
		/**
		 * get the config
		 * @return {object}
		 */
		getConfig: function() {
			return config;
		},
		/**
		 * get the scrollbarMargin
		 * @return {number}
		 */
		getScrollbarMargin: function() {
			return scrollbarMargin;
		},
		/**
		 * get the scrollbarHoverMargin
		 * @return {number}
		 */
		getScrollbarHoverMargin: function() {
			return scrollbarHoverMargin;
		}
	});
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
					contentElement = ctrl.getContentElement(),
					scrollbar = angular.element(element[0].querySelector('.ngscrollbar-y')),
					scrollbarMargin = ctrl.getScrollbarMargin(),
					scrollbarHoverMargin = ctrl.getScrollbarHoverMargin();

				scope.styles = {
					scrollbarContainer: {
						position: 'absolute',
						width: config.scrollbarContainer.width + 'px',
						height: '100%',
						top: 0,
						right: 0,
						transition: 'background .3s ease-in-out',
						'border-radius': config.scrollbarContainer.width / 2 + 'px'
					},
					scrollbar: {
						position: 'absolute',
						width: config.scrollbar.width + 'px',
						right: scrollbarMargin + 'px',
						cursor: 'default',
						opacity: 0,
						transition: 'opacity .3s ease-in-out, border-radius .1s linear, width .1s linear, right .1s linear',
						background: config.scrollbar.color,
						'border-radius': config.scrollbar.width / 2 + 'px'
					}
				};

				var getContentHeight = function() {
					return contentElement[0].offsetHeight;
				};

				var getContainerHeight = function() {
					return containerElement[0].offsetHeight;
				};

				var getScrollbarHeight = function() {
					var height = Math.pow(getContainerHeight(), 2) / getContentHeight() - scrollbarMargin*2;
					return height;
				};

				var isOverflow = function() {
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
						element.css('display', 'block');
						scrollbar.css('top', scrollbarMargin + 'px'); // set scrollbar top
						scrollbar.css('height', getScrollbarHeight() + 'px');
					} else {
						element.css('display', 'none');
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
						scroll(-event.deltaY * 40);// the ff delta value is 3 or -3 when scroll and the chrome or ie is -120 or 120, so it must multiply by 40
					});
				}

				element.on('mouseenter', function(event) {
					element.css('background', config.scrollbarContainer.color);
					scrollbar.css('width', config.scrollbar.hoverWidth + 'px');
					scrollbar.css('right', scrollbarHoverMargin + 'px');
					scrollbar.css('border-radius', config.scrollbar.hoverWidth / 2 + 'px');
				});

				element.on('mouseleave', function(event) {
					element.css('background', 'none');
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
					scrollbar = angular.element(element[0].querySelector('.ngscrollbar-x')),
					scrollbarMargin = ctrl.getScrollbarMargin(),
					scrollbarHoverMargin = ctrl.getScrollbarHoverMargin();

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