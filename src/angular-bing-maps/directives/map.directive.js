/*global angular, Microsoft*/

function bingMapDirective(angularBingMaps, $window, MapUtils) {
    'use strict';

    return {
        template: '<div ng-transclude></div>',
        restrict: 'EA',
        transclude: true,
        scope: {
            credentials: '=',
            center: '=?',
            zoom: '=?',
            mapType: '=?',
            events: '=?',
            options: '=?',
            onMapReady: '&?'
        },
        controller: function ($scope, $element) {
            // Controllers get instantiated before link function is run, so instantiate the map in the Controller
            // so that it is available to child link functions
            var _this = this;
            var isBingMapsLoaded = false;
            var bingMapsReadyCallbacks = [];
            _this.onBingMapsReady = function(callback) {
                if (_this.isBingMapsLoaded) {
                    callback();
                } else {
                    bingMapsReadyCallbacks.push(callback);
                }
            };

            $window.angularBingMapsReady = function() {
                // Get default mapOptions the user set in config block
                var mapOptions = angularBingMaps.getDefaultMapOptions();

                // Add in any options they passed directly into the directive
                angular.extend(mapOptions, $scope.options);

                if (mapOptions) {
                    //If the user didnt set credentials in config block, look for them on scope
                    if (!mapOptions.hasOwnProperty('credentials')) {
                        mapOptions.credentials = $scope.credentials;
                    }
                } else {
                    //The user didnt set any mapOptions on the scope OR in the config block, so create a default one
                    mapOptions = {credentials: $scope.credentials};
                }

                var $container = $element[0];
                $container.style.display = 'block';

                _this.map = new Microsoft.Maps.Map($container, mapOptions);

                var eventHandlers = {};
                $scope.map = _this.map;

                /*
                    Since Bing Maps fires view change events as soon as the map loads, we have to wait until after the
                    initial viewchange event has completed before we bind to $scope.center. Otherwise the user's
                    $scope.center will always be set to {0, 0} when the map loads
                */
                var initialViewChangeHandler = Microsoft.Maps.Events.addHandler($scope.map, 'viewchangeend', function() {
                    Microsoft.Maps.Events.removeHandler(initialViewChangeHandler);
                    //Once initial view change has ended, bind the user's specified handler to view change
                    var centerBindEvent = angularBingMaps.getCenterBindEvent();
                    Microsoft.Maps.Events.addHandler($scope.map, centerBindEvent, function(event) {
                        $scope.center = $scope.map.getCenter();
                        //This will sometimes throw $digest errors, but is required to keep $scope.center in sync
                        //$scope.$apply();
                    });
                });

                $scope.$watch('center', function (center) {
                    $scope.map.setView({animate: true, center: center});
                });

                $scope.$watch('zoom', function (zoom) {
                    $scope.map.setView({animate: true, zoom: zoom});
                });

                $scope.$watch('mapType', function (mapTypeId) {
                    $scope.map.setView({animate: true, mapTypeId: mapTypeId});
                });

                $scope.$watch('options', function(options) {
                    if (options !== undefined) {
                        $scope.map.setOptions(options);
                    }
                });

                $scope.$watch('events', function (events) {
                    //Loop through each event handler
                    angular.forEach(events, function (usersHandler, eventName) {
                        //If we already created an event handler, remove it
                        if (eventHandlers.hasOwnProperty(eventName)) {
                            Microsoft.Maps.Events.removeHandler(eventHandlers[eventName]);
                        }

                        var bingMapsHandler = Microsoft.Maps.Events.addHandler($scope.map, eventName, function (event) {
                            usersHandler(event);
                            $scope.$apply();
                        });

                        eventHandlers[eventName] = bingMapsHandler;
                    });
                });
                MapUtils._executeOnBingMapsReadyCallbacks();
                $scope.$apply();
                $scope.$broadcast('abm-v8-ready');
                while(bingMapsReadyCallbacks.length) {
                    bingMapsReadyCallbacks.pop()();
                }
                isBingMapsLoaded = true;
            };

        },
        link: function ($scope, $element, attr, ctrl) {
            ctrl.onBingMapsReady(function() {
                if ($scope.onMapReady) {
                    $scope.onMapReady({ map: $scope.map });
                }
            });
        }
    };

}

angular.module('angularBingMaps.directives').directive('bingMap', bingMapDirective);
