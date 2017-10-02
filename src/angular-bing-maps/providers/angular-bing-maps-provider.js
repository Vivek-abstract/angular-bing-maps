/*global angular, Microsoft */

function angularBingMapsProvider() {
    'use strict';

    var defaultMapOptions = {};

    var centerBindEvent = 'viewchangeend';

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

    return {
        setDefaultMapOptions: setDefaultMapOptions,
        bindCenterRealtime: bindCenterRealtime,
        $get: function() {
            return {
                getDefaultMapOptions: getDefaultMapOptions,
                getCenterBindEvent: getCenterBindEvent
            };
        }
    };

}

angular.module('angularBingMaps.providers').provider('angularBingMaps', angularBingMapsProvider);
