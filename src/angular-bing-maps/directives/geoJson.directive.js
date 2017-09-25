/*global angular, Microsoft, GeoJSONModule, console*/

function geoJsonDirective() {
    'use strict';

    function link(scope, element, attrs, mapCtrl) {
        Microsoft.Maps.loadModule(['Microsoft.Maps.GeoJson', 'Microsoft.Maps.AdvancedShapes'], function () {
            init();
        });

        var map;
        var drawingLayer;

        function init() {
            map = mapCtrl.map;
            drawingLayer = new Microsoft.Maps.Layer();
            map.layers.insert(drawingLayer);

            processGeoJson(scope.model);

            scope.$watch('model', function () {
                processGeoJson(scope.model);
            });

            scope.$on('$destroy', function() {
                map.layers.remove(drawingLayer);
            });
        }

        function processGeoJson(model) {
            if (model) {
                var shapes = Microsoft.Maps.GeoJson.read(model);
                drawingLayer.add(shapes);
            } else {
                drawingLayer.clear();
            }
        }
    }

    return {
        link: link,
        restrict: 'EA',
        scope: {
            model: '='
        },
        require: '^bingMap'
    };

}

angular.module('angularBingMaps.directives').directive('geoJson', geoJsonDirective);
