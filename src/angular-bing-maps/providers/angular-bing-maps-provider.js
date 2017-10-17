/*global angular, Microsoft */

function angularBingMapsProvider() {
    'use strict';

    var defaultMapOptions = {};

    var centerBindEvent = 'viewchangeend';

    var iconFontFamily = 'Arial';
    
    var additionalMicrosoftModules = [
        'Microsoft.Maps.WellKnownText', 
        'Microsoft.Maps.AdvancedShapes', 
        'Microsoft.Maps.GeoJson', 
        'Microsoft.Maps.DrawingTools', 
        'Microsoft.Maps.SpatialMath'
    ];

    function setDefaultMapOptions(usersOptions) {
        defaultMapOptions = usersOptions;
    }

    function getDefaultMapOptions() {
        return defaultMapOptions;
    }

    function bindCenterRealtime(_bindCenterRealtime) {
        if(_bindCenterRealtime) {
            centerBindEvent = 'viewchange';
        } else {
            centerBindEvent = 'viewchangeend';
        }
    }

    function getCenterBindEvent() {
        return centerBindEvent;
    }

    function setIconFontFamily(family) {
        iconFontFamily = family;
    }
    function getIconFontFamily() {
        return iconFontFamily;
    }
    
    function setAdditionalMicrosoftModules(modules) {
        additionalMicrosoftModules = modules;
    }
    function getAdditionalMicrosoftModules() {
        return additionalMicrosoftModules;
    }

    return {
        setDefaultMapOptions: setDefaultMapOptions,
        bindCenterRealtime: bindCenterRealtime,
        setIconFontFamily: setIconFontFamily,
        setAdditionalMicrosoftModules: setAdditionalMicrosoftModules,
        $get: function() {
            return {
                getDefaultMapOptions: getDefaultMapOptions,
                getCenterBindEvent: getCenterBindEvent,
                getIconFontFamily: getIconFontFamily,
                getAdditionalMicrosoftModules: getAdditionalMicrosoftModules
            };
        }
    };

}

angular.module('angularBingMaps.providers').provider('angularBingMaps', angularBingMapsProvider);
