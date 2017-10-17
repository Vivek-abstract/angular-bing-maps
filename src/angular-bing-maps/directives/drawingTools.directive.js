/*global angular, Microsoft, DrawingTools, console*/

function drawingToolsDirective(MapUtils) {
    'use strict';

    function link(scope, element, attrs, mapCtrl) {
        MapUtils.onBingMapsReady(function() {

            var map;
            var tools;
            var drawingLayer;
            var currentShape;
            var currentMode;
            var events = [];

            var style = {
                color: 'purple',
                fillColor: 'rgba(0,255,0,0.5)',
                strokeColor: 'blue',
                strokeThickness: 3
            };

            map = mapCtrl.map;

            // Create a layer for the drawn shapes.
            drawingLayer = new Microsoft.Maps.Layer();
            map.layers.insert(drawingLayer);

            tools = new Microsoft.Maps.DrawingTools(map);

            setOptions();

            if (scope.onShapeChange) {
                Microsoft.Maps.Events.addHandler(tools, 'drawingEnded', function(shapes) {
                    scope.onShapeChange({shapes: shapes});
                    scope.$apply();

                    currentShape = null;
                });
            }

            scope.$watch('drawThisShape', function (shape) {
                if (shape === null || shape === 'none') {
                    resetDrawingState();
                } else {
                    setDrawingMode(shape);
                }
            });

            scope.$on('DRAWINGTOOLS.CLEAR', function() {
                drawingLayer.clear();
            });

            function setOptions() {
                if (scope.strokeColor) {
                    style.strokeColor = MapUtils.makeMicrosoftColor(scope.strokeColor);
                }

                if (scope.fillColor) {
                    style.fillColor = MapUtils.makeMicrosoftColor(scope.fillColor);
                }
            }

            // Most of the code below is based on:
            // https://github.com/Microsoft/BingMapsV8CodeSamples/blob/master/Samples/Drawing%20Tools/Fully%20Custom%20Drawing%20Toolbar.html
            function setDrawingMode(mode) {
                switch (mode) {
                    case 'pushpin':
                    drawPushpin();
                    break;
                    case 'polyline':
                    drawPolyline();
                    break;
                    case 'polygon':
                    drawPolygon();
                    break;
                    case 'circle':
                    drawCircle();
                    break;
                    case 'rectangle':
                    drawRectangle();
                    break;
                    case 'edit':
                    edit();
                    break;
                    case 'erase':
                    erase();
                    break;
                    default:
                    break;
                }
            }


            // TODO: Pushpin functionality not fully tested...
            function drawPushpin() {
                if (setMode('pushpin')) {
                    //Add a click event to the map to add pushpins.
                    events.push(Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
                        currentShape = new Microsoft.Maps.Pushpin(e.location, {
                            color: style.color
                        });

                        drawingLayer.add(currentShape);
                    }));
                }
            }

            // TODO: Polyline functionality not fully tested...
            function drawPolyline() {
                if (setMode('polyline')) {
                    //Create a new polyline.
                    tools.create(Microsoft.Maps.DrawingTools.ShapeType.polyline, function (s) {
                        s.setOptions(style);
                        currentShape = s;
                    });
                }
            }

            function drawPolygon() {
                if (setMode('polygon')) {
                    events.push(Microsoft.Maps.Events.addHandler(map, 'mousedown', function(e) {
                        if (currentShape != null) {
                            return;
                        }

                        // Disable zooming & lock map so it doesn't move when dragging
                        map.setOptions({ disablePanning: true, disableZooming: true });

                        // Create a new polygon
                        tools.create(Microsoft.Maps.DrawingTools.ShapeType.polygon, function(s) {
                            s.setOptions(style);
                            currentShape = s;
                        });
                    }));

                    events.push(Microsoft.Maps.Events.addHandler(map, 'dblclick', function (e) {
                        // Unlock map panning & zooming
                        setTimeout(function(){ map.setOptions({ disablePanning: false, disableZooming: false }); }, 1);
                        resetDrawingState();
                    }));
                }
            }

            function drawCircle() {
                if (setMode('circle')) {
                    var isMouseDown = false;

                    events.push(Microsoft.Maps.Events.addHandler(map, 'click', function(e) {
                        if (currentShape != null) {
                            return;
                        }

                        // Disable zooming & lock map so it doesn't move when dragging
                        map.setOptions({ disablePanning: true, disableZooming: true });

                        // Create a polygon for the circle
                        currentShape = new Microsoft.Maps.Polygon([e.location, e.location, e.location], style);

                        // Store the center point in the polygons metadata
                        currentShape.metadata = {
                            type: 'circle',
                            center: e.location
                        };

                        drawingLayer.add(currentShape);

                        isMouseDown = true;
                    }));

                    events.push(Microsoft.Maps.Events.addHandler(map, 'mousemove', function(e) {
                        if (isMouseDown) {
                            scaleCircle(e);
                        }
                    }));

                    events.push(Microsoft.Maps.Events.addHandler(map, 'dblclick', function(e) {
                        scaleCircle(e);

                        // Unlock map panning & zooming
                        setTimeout(function() { map.setOptions({ disablePanning: false, disableZooming: false }); }, 1);

                        isMouseDown = false;

                        Microsoft.Maps.Events.invoke(tools, 'drawingEnded', currentShape);
                    }));
                }
            }

            function scaleCircle(e) {
                if (currentShape && currentShape.metadata && currentShape.metadata.type === 'circle') {
                    //Calculate distance from circle center to mouse.
                    var radius = Microsoft.Maps.SpatialMath.getDistanceTo(currentShape.metadata.center, e.location);

                    //Calculate circle locations.
                    var locs = Microsoft.Maps.SpatialMath.getRegularPolygon(currentShape.metadata.center, radius, 100);

                    currentShape.metadata.radius = radius;

                    //Update the circles location.
                    currentShape.setLocations(locs);
                }
            }

            function editCircle(e) {
                //Lock map so it doesn't move when dragging.
                map.setOptions({ disablePanning: true });

                var circle = e.primitive;

                var distanceCenter = Microsoft.Maps.SpatialMath.getDistanceTo(e.location, circle.metadata.center);
                var radius = Microsoft.Maps.SpatialMath.getDistanceTo(circle.metadata.center, circle.getLocations()[0]);

                //If the initial location is closer to the center of the circle, move it, otherwise scale it.
                if (distanceCenter < (radius - distanceCenter)) {
                    events.push(Microsoft.Maps.Events.addHandler(map, 'mousemove', function (e) {
                        currentShape.metadata.center = e.location;

                        var locs = Microsoft.Maps.SpatialMath.getRegularPolygon(currentShape.metadata.center, radius, 100);
                        currentShape.setLocations(locs);
                    }));

                    events.push(Microsoft.Maps.Events.addHandler(map, 'mouseup', function (e) {
                        currentShape.metadata.center = e.location;

                        var locs = Microsoft.Maps.SpatialMath.getRegularPolygon(currentShape.metadata.center, radius, 100);
                        currentShape.setLocations(locs);

                        //Unlock map panning.
                        map.setOptions({ disablePanning: false });

                        //Remove all events except the first one.
                        for (var i = 1; i < events.length; i++) {
                            Microsoft.Maps.Events.removeHandler(events[i]);
                        }
                    }));

                } else {
                    events.push(Microsoft.Maps.Events.addHandler(map, 'mousemove', function (e) {
                        scaleCircle(e);
                    }));

                    events.push(Microsoft.Maps.Events.addHandler(map, 'mouseup', function (e) {
                        scaleCircle(e);

                        //Unlock map panning.
                        map.setOptions({ disablePanning: false });

                        //Remove all events except the first one.
                        for (var i = 1; i < events.length; i++) {
                            Microsoft.Maps.Events.removeHandler(events[i]);
                        }
                    }));
                }
            }

            function drawRectangle() {
                if (setMode('rectangle')) {
                    var isMouseDown = false;

                    events.push(Microsoft.Maps.Events.addHandler(map, 'click', function(e) {
                        if (currentShape != null) {
                            return;
                        }

                        // Disable zooming & lock map so it doesn't move when dragging
                        map.setOptions({ disablePanning: true, disableZooming: true });

                        //Create a polygon for the circle.
                        currentShape = new Microsoft.Maps.Polygon([e.location, e.location, e.location], style);

                        //Store the center point in the polygons metadata.
                        currentShape.metadata = {
                            type: 'rectangle'
                        };

                        drawingLayer.add(currentShape);

                        isMouseDown = true;
                    }));

                    events.push(Microsoft.Maps.Events.addHandler(map, 'mousemove', function(e) {
                        if (isMouseDown) {
                            updateRectangle(e);
                        }
                    }));

                    events.push(Microsoft.Maps.Events.addHandler(map, 'dblclick', function(e) {
                        updateRectangle(e);

                        // Unlock map panning & zooming
                        setTimeout(function() { map.setOptions({ disablePanning: false, disableZooming: false }); }, 1);

                        isMouseDown = false;

                        Microsoft.Maps.Events.invoke(tools, 'drawingEnded', currentShape);
                    }));
                }
            }

            function editRectangle(e) {
                //Find the closest rectangle corner to the specified location and update that index.
                var locIdx = 0;
                var locs = currentShape.getLocations();

                var rectangle = e.primitive;

                var minDistance = Microsoft.Maps.SpatialMath.getDistanceTo(e.location, locs[0]);
                var tempDistance;

                for (var i = 1; i < locs.length; i++) {
                    tempDistance = Microsoft.Maps.SpatialMath.getDistanceTo(e.location, locs[i]);
                    if (tempDistance < minDistance) {
                        minDistance = tempDistance;
                        locIdx = i;
                    }
                }

                //Lock map panning.
                map.setOptions({ disablePanning: true });

                events.push(Microsoft.Maps.Events.addHandler(map, 'mousemove', function (e) {
                    updateRectangle(e, locIdx);
                }));

                events.push(Microsoft.Maps.Events.addHandler(map, 'mouseup', function (e) {
                    updateRectangle(e, locIdx);

                    //Unlock map panning.
                    map.setOptions({ disablePanning: false });

                    //Remove all events except the first one.
                    for (var i = 1; i < events.length; i++) {
                        Microsoft.Maps.Events.removeHandler(events[i]);
                    }
                }));
            }

            function updateRectangle(e, firstCornerIdx) {
                if (typeof firstCornerIdx === 'undefined') {
                    firstCornerIdx = 2;
                }

                if (currentShape && currentShape.metadata && currentShape.metadata.type === 'rectangle') {
                    //Get the first corner of the rectangle.
                    var locs = currentShape.getLocations();

                    var secondIdx = (firstCornerIdx + 1) % 4;
                    var thirdCornerIdx = (firstCornerIdx + 2) % 4;
                    var fourthCornerIdx = (firstCornerIdx + 3) % 4;

                    //Update the opposite corner of the rectangle.
                    locs[firstCornerIdx] = e.location;

                    //Calculate the other 3 corners of the rectanle.
                    locs[secondIdx] = new Microsoft.Maps.Location(locs[thirdCornerIdx].latitude,
                        locs[firstCornerIdx].longitude);

                        locs[fourthCornerIdx] = new Microsoft.Maps.Location(locs[firstCornerIdx].latitude,
                            locs[thirdCornerIdx].longitude);

                            if (locs.length === 5) {
                                locs[4] = locs[0];
                            }

                            currentShape.setLocations(locs);
                        }
                    }

                    // TODO: Edit functionality not fully tested...
                    function edit() {
                        if (setMode('edit')) {
                            //Enable pushpin dragging in layer.
                            setPushpinDraggability(true);

                            events.push(Microsoft.Maps.Events.addHandler(drawingLayer, 'mousedown', function (e) {
                                resetDrawingState();

                                currentShape = e.primitive;

                                if (e.primitive.metadata && e.primitive.metadata.type === 'circle') {
                                    editCircle(e);
                                } else if (e.primitive.metadata && e.primitive.metadata.type === 'rectangle') {
                                    editRectangle(e);
                                } else if (e.primitive instanceof Microsoft.Maps.Polyline ||
                                    e.primitive instanceof Microsoft.Maps.Polygon) {
                                        //Remove the shape from the map as the drawing tools will display it in the drawing layer.
                                        drawingLayer.remove(e.primitive);

                                        //Pass the shape to the drawing tools to be edited.
                                        tools.edit(e.primitive);
                                    }
                                }));
                            } else {
                                //Disable pushpin dragging in layer.
                                setPushpinDraggability(false);
                            }
                        }

                        // TODO: Erase functionality not fully tested...
                        function erase() {
                            if (setMode('erase')) {
                                events.push(Microsoft.Maps.Events.addHandler(drawingLayer, 'mousedown', function (e) {
                                    drawingLayer.remove(e.primitive);
                                }));
                            }
                        }

                        // Sets the drawing mode, or toggles out of a mode if it is already set.
                        // Returns true if the specified mode is new
                        function setMode(mode) {
                            // Remove all attached events
                            for (var i = 0; i < events.length; i++){
                                Microsoft.Maps.Events.removeHandler(events[i]);
                            }

                            events = [];

                            // Unlock map so incase it has been locked previously
                            map.setOptions({ disablePanning: true });

                            var state = false;

                            if (currentMode === mode || mode === null) {
                                // Toggle out of currentMode mode
                                currentMode = null;
                            } else {
                                currentMode = mode;
                                state = true;
                            }

                            resetDrawingState();

                            return state;
                        }

                        function resetDrawingState() {
                            // Stop any current drawing
                            if (currentShape) {
                                tools.finish(function (s) {
                                    // Add the completed shape to the drawning to the drawing layer
                                    drawingLayer.add(s);
                                });

                                currentShape = null;
                            }

                            if (currentMode !== 'edit') {
                                //Disable pushpin dragging in layer.
                                setPushpinDraggability(false);
                            }
                        }

                        function setPushpinDraggability(draggable) {
                            var shapes = drawingLayer.getPrimitives();

                            for (var i = 0, len = shapes.length; i < len; i++) {
                                if (shapes[i] instanceof Microsoft.Maps.Pushpin) {
                                    shapes[i].setOptions({ draggable: draggable });
                                }
                            }
                        }

                        function updateShapeStyle() {
                            if (currentShape) {
                                currentShape.setOptions(style);

                                //If the shape is a poly type it may be in edit mode, take it out, update and put it back in.
                                if (currentShape instanceof Microsoft.Maps.Polyline || currentShape instanceof Microsoft.Maps.Polygon) {
                                    tools.finish(function (s) {
                                        s.setOptions(style);
                                        tools.edit(s);
                                    });
                                }
                            }
                        }

        });
    }

    return {
        link: link,
        restrict: 'EA',
        scope: {
            onShapeChange: '&',
            drawThisShape: '=',
            strokeColor: '=?',
            fillColor: '=?'
        },
        require: '^bingMap'
    };

}

angular.module('angularBingMaps.directives').directive('drawingTools', drawingToolsDirective);
