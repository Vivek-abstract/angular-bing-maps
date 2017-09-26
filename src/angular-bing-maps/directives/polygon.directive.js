/*global angular, Microsoft, DrawingTools, console*/

function polygonDirective(MapUtils) {
    'use strict';

    function link(scope, element, attrs, mapCtrl) {
        var bingMapLocations = [];
        var eventHandlers = {};

        function generateBingMapLocations() {
            bingMapLocations = MapUtils.convertToMicrosoftLatLngs(scope.locations);
        }

        generateBingMapLocations();

        var polygon = new Microsoft.Maps.Polygon(bingMapLocations);
        mapCtrl.map.entities.push(polygon);

        function generateOptions() {
            if (!scope.options) {
                scope.options = {};
            }

            if (scope.fillColor) {
                scope.options.fillColor = MapUtils.makeMicrosoftColor(scope.fillColor);
            }

            if (scope.strokeColor) {
                scope.options.strokeColor = MapUtils.makeMicrosoftColor(scope.strokeColor);
            }
        }

        scope.$watch('options', function (newOptions) {
            if (newOptions === undefined) {
                return;
            }

            polygon.setOptions(newOptions);
        }, true);

        scope.$watch('locations', function() {
            generateBingMapLocations();
            polygon.setLocations(bingMapLocations);
        });

        scope.$watch('fillColor', generateOptions);
        scope.$watch('strokeColor', generateOptions);

        scope.$on('$destroy', function() {
            mapCtrl.map.entities.remove(polygon);
        });

        scope.$watch('events', function(events) {
            // Loop through each event handler
            angular.forEach(events, function(usersHandler, eventName) {
                // If we already created an event handler, remove it
                if (eventHandlers.hasOwnProperty(eventName)) {
                    Microsoft.Maps.Events.removeHandler(eventHandlers[eventName]);
                }

                var bingMapsHandler = Microsoft.Maps.Events.addHandler(polygon, eventName, function(event) {
                    // As a convenience, add tracker id to target attribute for user to ID target of event
                    if (typeof scope.trackBy !== 'undefined') {
                        event.target['trackBy'] = scope.trackBy;
                    }

                    usersHandler(event);
                    scope.$apply();
                });

                eventHandlers[eventName] = bingMapsHandler;
            });
        });
    }

    return {
        link: link,
        restrict: 'EA',
        scope: {
            options: '=?',
            locations: '=',
            fillColor: '=?',
            strokeColor: '=?',
            events: '=?',
            trackBy: '=?'
        },
        require: '^bingMap'
    };

}

angular.module('angularBingMaps.directives').directive('abmPolygon', polygonDirective);
