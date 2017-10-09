/*global angular, Microsoft, DrawingTools, console*/

function mapUtilsService($q, angularBingMaps) {
    'use strict';
    var color = require('color');
    var advancedShapesLoaded = false;
    var _isBingMapsLoaded = false;
    var bingMapsOnLoadCallbacks = [];

    function makeMicrosoftColor(colorStr) {
        var c = color(colorStr);
        return new Microsoft.Maps.Color(Math.floor(255*c.alpha()), c.red(), c.green(), c.blue());
    }

    function makeMicrosoftLatLng(location) {
        if (angular.isArray(location)) {
            return new Microsoft.Maps.Location(location[1], location[0]);
        } else if (location.hasOwnProperty('latitude') && location.hasOwnProperty('longitude')) {
            return new Microsoft.Maps.Location(location.latitude, location.longitude);
        } else if (location.hasOwnProperty('lat') && location.hasOwnProperty('lng')) {
            return new Microsoft.Maps.Location(location.lat, location.lng);
        } else {
            if(console && console.error) {
                console.error('Your coordinates are in a non-standard form. '+
                              'Please refer to the Angular Bing Maps '+
                              'documentation to see supported coordinate formats');
            }
            return null;
        }
    }

    function convertToMicrosoftLatLngs(locations) {
        var bingLocations = [];
        if (!locations) {
            return bingLocations;
        }
        for (var i=0;i<locations.length;i++) {
            var latLng = makeMicrosoftLatLng(locations[i]);
            bingLocations.push(latLng);
        }
        return bingLocations;
    }

    function flattenEntityCollection(ec) {
        var flat = flattenEntityCollectionRecursive(ec);
        var flatEc = new Microsoft.Maps.EntityCollection();
        var entity = flat.pop();
        while(entity) {
            flatEc.push(entity);
            entity = flat.pop();
        }
        return flatEc;
    }

    function flattenEntityCollectionRecursive(ec) {
        var flat = [];
        var entity = ec.pop();
        while(entity) {
            if (entity && !(entity instanceof Microsoft.Maps.EntityCollection)) {
                flat.push(entity);
            } else if (entity) {
                flat.concat(flattenEntityCollectionRecursive(entity));
            }
            entity = ec.pop();
        }
        return flat;
    }

    function loadAdvancedShapesModule() {
        var defered = $q.defer();
        if(!advancedShapesLoaded) {
            Microsoft.Maps.loadModule('Microsoft.Maps.AdvancedShapes', { callback: function(){
                defered.resolve();
            }});
        } else {
            defered.resolve();
        }
        return defered.promise;
    }

    function createFontPushpin(text, fontSizePx, color) {
        var c = document.createElement('canvas');
        var ctx = c.getContext('2d');

        //Define font style
        var font = fontSizePx + 'px ' + angularBingMaps.getIconFontFamily();
        ctx.font = font;

        //Resize canvas based on sie of text.
        var icon = String.fromCharCode(parseInt(text, 16));
        var size = ctx.measureText(icon);
        c.width = size.width;
        c.height = fontSizePx;

        //Reset font as it will be cleared by the resize.
        ctx.font = font;
        ctx.textBaseline = 'top';
        ctx.fillStyle = color;

        ctx.fillText(icon, 0, 0);

        return {
            icon: c.toDataURL(),
            anchor: new Microsoft.Maps.Point(c.width / 2, c.height)
        };
    }

    function onBingMapsReady(callback) {
        if (_isBingMapsLoaded) {
            callback();
        } else {
            bingMapsOnLoadCallbacks.push(callback);
        }
    }

    function _executeOnBingMapsReadyCallbacks() {
        if(_isBingMapsLoaded) {
            //Bing maps was already loaded
            return;
        }
        _isBingMapsLoaded = true;
        for (var i=0; i<bingMapsOnLoadCallbacks.length; i++) {
            bingMapsOnLoadCallbacks[i]();
        }
        //We are done with this list, destroy the reference to it
        bingMapsOnLoadCallbacks = null;
    }

    function isBingMapsLoaded() {
        return _isBingMapsLoaded;
    }

    var hasWKTBeenLoaded = false;
    var isWKTCurrentlyLoading = false;
    var wktCallbacks = [];
    function loadWKTModule(callback) {
        if (hasWKTBeenLoaded) {
            console.debug('WKT Module already loaded, firing callback');
            if (callback && typeof callback === 'function') {callback();}
        } else if (isWKTCurrentlyLoading) {
            console.debug('WKT Module is currently loading, pushing callback into list');
            wktCallbacks.push(callback);
        } else {
            //Only call this method once to avoid kicking off multiple digest cycles
            isWKTCurrentlyLoading = true;
            wktCallbacks.push(callback);
            console.debug('WKT Module not loaded, calling Microsoft.Maps.loadModule');
            Microsoft.Maps.loadModule(['Microsoft.Maps.WellKnownText', 'Microsoft.Maps.AdvancedShapes'], function() {
                console.debug('Ok, WKT Module loaded now. Firing callbacks...');
                for(var i=0;i<wktCallbacks.length;i++) {
                    var cb = wktCallbacks[i];
                    console.debug('Firing WKT callback number ' + i);
                    if (cb && typeof cb === 'function') {cb();}
                }
            });
        }
    }

    var hasGeoJsonBeenLoaded = false;
    var isGeoJsonCurrentlyLoading = false;
    var geoJsonCallbacks = [];
    function loadGeoJsonModule(callback) {
        if (hasGeoJsonBeenLoaded) {
            if (callback && typeof callback === 'function') {callback();}
        } else if (isGeoJsonCurrentlyLoading) {
            geoJsonCallbacks.push(callback);
        } else {
            //Only call this method once to avoid kicking off multiple digest cycles
            isGeoJsonCurrentlyLoading = true;
            geoJsonCallbacks.push(callback);
            Microsoft.Maps.loadModule(['Microsoft.Maps.GeoJson', 'Microsoft.Maps.AdvancedShapes'], function() {
                for(var i=0;i<geoJsonCallbacks.length;i++) {
                    var cb = geoJsonCallbacks[i];
                    if (cb && typeof cb === 'function') {cb();}
                }
            });
        }
    }

    var hasDrawingToolsBeenLoaded = false;
    var isDrawingToolsCurrentlyLoading = false;
    var drawingToolsCallbacks = [];
    function loadDrawingToolsModule(callback) {
        if (hasDrawingToolsBeenLoaded) {
            if (callback && typeof callback === 'function') {callback();}
        } else if (isDrawingToolsCurrentlyLoading) {
            drawingToolsCallbacks.push(callback);
        } else {
            //Only call this method once to avoid kicking off multiple digest cycles
            isDrawingToolsCurrentlyLoading = true;
            drawingToolsCallbacks.push(callback);
            Microsoft.Maps.loadModule(['Microsoft.Maps.DrawingTools', 'Microsoft.Maps.SpatialMath'], function() {
                for(var i=0;i<drawingToolsCallbacks.length;i++) {
                    var cb = drawingToolsCallbacks[i];
                    if (cb && typeof cb === 'function') {cb();}
                }
            });
        }
    }


    return {
        makeMicrosoftColor: makeMicrosoftColor,
        makeMicrosoftLatLng: makeMicrosoftLatLng,
        convertToMicrosoftLatLngs: convertToMicrosoftLatLngs,
        flattenEntityCollection: flattenEntityCollection,
        loadAdvancedShapesModule: loadAdvancedShapesModule,
        createFontPushpin: createFontPushpin,
        onBingMapsReady: onBingMapsReady,
        isBingMapsLoaded: isBingMapsLoaded,
        loadWKTModule: loadWKTModule,
        loadGeoJsonModule: loadGeoJsonModule,
        loadDrawingToolsModule: loadDrawingToolsModule,
        _executeOnBingMapsReadyCallbacks: _executeOnBingMapsReadyCallbacks
    };

}

angular.module('angularBingMaps.services').service('MapUtils', mapUtilsService);
