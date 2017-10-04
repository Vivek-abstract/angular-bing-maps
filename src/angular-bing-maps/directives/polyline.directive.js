/*global angular, Microsoft, DrawingTools, console*/

function polylineDirective(MapUtils) {
    'use strict';

    function link(scope, element, attrs, mapCtrl) {
        mapCtrl.onBingMapsReady(function() {

            var bingMapLocations = [];

            function generateBingMapLocations() {
                bingMapLocations = MapUtils.convertToMicrosoftLatLngs(scope.locations);
            }

            generateBingMapLocations();

            var polyline = new Microsoft.Maps.Polyline(bingMapLocations);
            mapCtrl.map.entities.push(polyline);

            function generateOptions() {
                if (!scope.options) {
                    scope.options = {};
                }

                if (scope.strokeColor) {
                    scope.options.strokeColor = MapUtils.makeMicrosoftColor(scope.strokeColor);
                }
            }

            scope.$watch('options', function (newOptions) {
                if (newOptions === undefined) {
                    return;
                }

                polyline.setOptions(newOptions);
            }, true);

            scope.$watch('locations', function() {
                generateBingMapLocations();
                polyline.setLocations(bingMapLocations);
            });

            scope.$watch('strokeColor', generateOptions);

            scope.$on('$destroy', function() {
                mapCtrl.map.entities.remove(polyline);
            });

        });
    }

    return {
        link: link,
        restrict: 'EA',
        scope: {
            options: '=?',
            locations: '=',
            strokeColor: '=?'
        },
        require: '^bingMap'
    };

}

angular.module('angularBingMaps.directives').directive('polyline', polylineDirective);
