/*global angular, Microsoft, DrawingTools, console, WKTModule*/

function wktDirective(MapUtils) {
    'use strict';

    function link(scope, element, attrs, mapCtrl) {
        scope.$on('abm-v8-ready', function() {

            Microsoft.Maps.loadModule(['Microsoft.Maps.WellKnownText', 'Microsoft.Maps.AdvancedShapes'], function () {
                init();
            });

            var map;
            var drawingLayer;
            var entity = null;
            var eventHandlers = [];

            function init() {
                map = mapCtrl.map;
                drawingLayer = new Microsoft.Maps.Layer();
                map.layers.insert(drawingLayer);

                processWkt(scope.text);
                initHandlers(scope.events);

                // Watchers
                scope.$watch('text', function(shape) {
                    processWkt(shape);
                }, true);

                scope.$watch('events', function(events) {
                    initHandlers(events);
                });

                scope.$watch('fillColor', setOptions, true);
                scope.$watch('strokeColor', setOptions, true);
            }

            function processWkt(shape) {
                if (entity) {
                    // Something is already on the map, remove that
                    drawingLayer.clear();
                }

                if (shape && typeof shape === 'string') {
                    // Read it and add it to the map
                    entity = Microsoft.Maps.WellKnownText.read(shape, scope.styles);
                    setOptions();
                    drawingLayer.add(entity);
                }
            }

            function setOptions() {
                //Entity not parsed yet
                if (!entity) { return; }
                var options = {};

                if (scope.fillColor) {
                    options.fillColor = MapUtils.makeMicrosoftColor(scope.fillColor);
                }

                if (scope.strokeColor) {
                    options.strokeColor = MapUtils.makeMicrosoftColor(scope.strokeColor);
                }

                if (entity instanceof Array) {
                    for (var i = 0; i < entity.getLength(); i++) {
                        if (entity.get(i) instanceof Microsoft.Maps.Polygon || entity.get(i) instanceof Microsoft.Maps.Polyline) {
                            entity.get(i).setOptions(options);
                        }
                    }
                } else {
                    entity.setOptions(options);
                }
            }

            function initHandlers(handlers) {
                removeAllHandlers();
                //Loop through each event handler
                angular.forEach(handlers, function(usersHandler, eventName) {
                    if (entity instanceof Microsoft.Maps.EntityCollection) {
                        //Add the handler to all entities in collection
                        for (var i = 0; i < entity.getLength(); i++) {
                            addHandler(entity.get(i), eventName, usersHandler);
                        }
                    } else {
                        addHandler(entity, eventName, usersHandler);
                    }
                });
            }

            function addHandler(target, eventName, userHandler) {
                var handler = Microsoft.Maps.Events.addHandler(target, eventName, function(event) {
                    if (typeof scope.trackBy !== 'undefined') {
                        event.target['trackBy'] = scope.trackBy;
                    }

                    userHandler(event);
                    scope.$apply();
                });

                eventHandlers.push(handler);
            }

            function removeAllHandlers() {
                var handler = eventHandlers.pop();
                while (typeof handler === 'function') {
                    Microsoft.Maps.Events.removeHandler(handler);
                    handler = eventHandlers.pop();
                }
            }

            scope.$on('$destroy', function() {
                map.layers.remove(drawingLayer);
            });

        });
    }

    return {
        link: link,
        restrict: 'EA',
        scope: {
            text: '=',
            events: '=?',
            trackBy: '=?',
            fillColor: '=?',
            strokeColor: '=?',
            styles: '=?'
        },
        require: '^bingMap'
    };

}

angular.module('angularBingMaps.directives').directive('wkt', wktDirective);
