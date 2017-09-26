/*global angular, Microsoft*/

function bingMapDirective(angularBingMaps) {
    'use strict';

    return {
        template: '<section><div ng-transclude></div></section>',
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
            var $section = $container.querySelector('section');

            $section.style.width = mapOptions.width;
            $section.style.height = mapOptions.height;

            this.map = new Microsoft.Maps.Map($section, mapOptions);

            var eventHandlers = {};
            $scope.map = this.map;

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
        },
        link: function ($scope, $element) {
            if ($scope.onMapReady) {
                $scope.onMapReady({ map: $scope.map });
            }
        }
    };

}

angular.module('angularBingMaps.directives').directive('bingMap', bingMapDirective);
