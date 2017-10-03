/*global angular, Microsoft */

function angularBingMapsProvider() {
    'use strict';

    var defaultMapOptions = {};

    var centerBindEvent = 'viewchangeend';

    var iconFontFamily = 'Arial';

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

    return {
        setDefaultMapOptions: setDefaultMapOptions,
        bindCenterRealtime: bindCenterRealtime,
        setIconFontFamily: setIconFontFamily,
        $get: function() {
            return {
                getDefaultMapOptions: getDefaultMapOptions,
                getCenterBindEvent: getCenterBindEvent,
                getIconFontFamily: getIconFontFamily
            };
        }
    };

}

angular.module('angularBingMaps.providers').provider('angularBingMaps', angularBingMapsProvider);
