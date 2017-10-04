/*global angular, Microsoft, DrawingTools, console*/

function infoBoxDirective() {
    'use strict';

    function link(scope, element, attrs, ctrls) {
        var mapCtrl = ctrls[0];
        var pushpinCtrl = ctrls[1];
        mapCtrl.onBingMapsReady(function() {

            var infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0.0 , 0.0));

            infobox.setMap(mapCtrl.map);

            function updateLocation() {
                //Ensure lat and lng are defined first
                if(scope.lat && scope.lng) {
                    infobox.setLocation(new Microsoft.Maps.Location(scope.lat, scope.lng));
                }
            }

            function updateOptions() {
                if (!scope.options) {
                    scope.options = {};
                }

                if (scope.title) {
                    scope.options.title = scope.title;
                }

                if (scope.description) {
                    scope.options.description = scope.description;
                }

                if (scope.hasOwnProperty('visible')) {
                    scope.options.visible = scope.visible;
                } else {
                    scope.options.visible = true;
                }

                infobox.setOptions(scope.options);
            }

            scope.$on('positionUpdated', function(event, location) {
                infobox.setLocation(location);
            });

            // This was not the child of a pushpin, so use the lat & lng
            if (!pushpinCtrl) {
                scope.$watch('lat', updateLocation);
                scope.$watch('lng', updateLocation);
            }

            scope.$watch('options', updateOptions);
            scope.$watch('title', updateOptions);
            scope.$watch('description', updateOptions);
            scope.$watch('visible', updateOptions);

            scope.$on('$destroy', unregisterEventListeners);
            element.on('$destroy', unregisterEventListeners);

            function unregisterEventListeners() {
                infobox.setMap(null);
            }

            updateOptions();

        });
    }

    return {
        link: link,
        restrict: 'EA',
        scope: {
            options: '=?',
            lat: '=?',
            lng: '=?',
            title: '=?',
            description: '=?',
            visible: '=?'
        },
        require: ['^bingMap', '?^pushpin']
    };

}

angular.module('angularBingMaps.directives').directive('infoBox', infoBoxDirective);
