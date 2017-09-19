/*global angular, Microsoft, DrawingTools, console*/

function tileLayerDirective() {
    'use strict';

    function link(scope, element, attrs, mapCtrl) {
        var tileSource, tileLayer;

        function createTileSource() {
            if (!tileSource) {
                tileSource = new Microsoft.Maps.TileSource({
                    uriConstructor: scope.source
                });
            }

            if (scope.options) {
                angular.extend(scope.options, {
                    mercator: tileSource
                });
            } else {
                scope.options = {
                    mercator: tileSource
                };
            }

            if (tileLayer) {
                tileLayer.setOptions(scope.options);
            } else {
                tileLayer = new Microsoft.Maps.TileLayer(scope.options);
                mapCtrl.map.layers.insert(tileLayer);
            }
        }

        scope.$watch(function(scope) {
            var options = scope.options;
            return {
                downloadTimeout: options.downloadTimeout,
                opacity: options.opacity,
                visible: options.visible,
                zIndex: options.zIndex
            };
        }, function() {
            createTileSource();
        }, true);

        scope.$watch('source', function() {
            createTileSource();
        });

        scope.$on('$destroy', function() {
            mapCtrl.map.layers.remove(tileLayer);
        });
    }

    return {
        link: link,
        template: '<div ng-transclude></div>',
        restrict: 'EA',
        transclude: true,
        scope: {
            options: '=?',
            source: '='
        },
        require: '^bingMap'
    };

}

angular.module('angularBingMaps.directives').directive('tileLayer', tileLayerDirective);
