/*global angular, Microsoft, DrawingTools, console*/

function pushpinDirective(MapUtils) {
    'use strict';

    function link(scope, element, attrs, mapCtrl) {
        scope.$on('abm-v8-ready', function() {
            var eventHandlers = {};

            function updatePosition() {
                if (!isNaN(scope.lat) && !isNaN(scope.lng)) {
                    scope.pin.setLocation(new Microsoft.Maps.Location(scope.lat, scope.lng));
                    scope.$broadcast('positionUpdated', scope.pin.getLocation());
                }
            }

            function updateFontIcon() {
                if (scope.fontIcon) {
                    var iconColor = scope.options ? scope.options.color : '#000';
                    var iconFontSize = scope.fontIconSize ? scope.fontIconSize : 30;
                    var iconText = scope.fontIcon;
                    var icon = MapUtils.createFontPushpin(iconText, iconFontSize, iconColor);
                    // Trigger the watch on scope.options with new icon
                    angular.extend(scope.options, icon);
                    updatePinOptions();
                }
            }

            function updatePinOptions() {
                if (scope.options === undefined) {
                    return;
                }

                scope.pin.setOptions(scope.options);
            }

            updatePosition();
            mapCtrl.map.entities.push(scope.pin);

            scope.$watch('lat', updatePosition);
            scope.$watch('lng', updatePosition);

            scope.$watch('options', updatePinOptions);
            updateFontIcon();

            scope.$watch('pushpinData', function (newPushpinData) {
                scope.pin.pushpinData = newPushpinData;
            });

            scope.$watch('events', function(events) {
                // Loop through each event handler
                angular.forEach(events, function(usersHandler, eventName) {
                    // If we already created an event handler, remove it
                    if (eventHandlers.hasOwnProperty(eventName)) {
                        Microsoft.Maps.Events.removeHandler(eventHandlers[eventName]);
                    }

                    var bingMapsHandler = Microsoft.Maps.Events.addHandler(scope.pin, eventName, function(event) {
                        // As a convenience, add tracker id to target attribute for user to ID target of event
                        if (typeof scope.trackBy !== 'undefined') {
                            event.target['trackBy'] = scope.trackBy;
                        }

                        usersHandler(event);
                        scope.$apply();
                    });

                    eventHandlers[eventName] = bingMapsHandler;
                });
            });

            scope.$watch('fontIcon', updateFontIcon);
            scope.$watch('fontIconSize', updateFontIcon);

            Microsoft.Maps.Events.addHandler(scope.pin, 'dragend', function (e) {
                var loc = e.entity.getLocation();
                scope.lat = loc.latitude;
                scope.lng = loc.longitude;
                scope.$apply();
            });

            function isValidEvent(event) {
                //TODO: Implement me like one of your french girls
                return true;
            }

            scope.$on('$destroy', function() {
                mapCtrl.map.entities.remove(scope.pin);

                // Is this necessary? Doing it just to be safe
                angular.forEach(eventHandlers, function(handler, eventName) {
                    Microsoft.Maps.Events.removeHandler(handler);
                });
            });

        });

    }

    return {
        link: link,
        controller: ['$scope', function ($scope) {
            var _this = this;
            $scope.$on('abm-v8-ready', function() {
                _this.pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(0.0, 0.0));
                $scope.pin = _this.pin;
            });
        }],
        template: '<div ng-transclude></div>',
        restrict: 'EA',
        transclude: true,
        scope: {
            options: '=?',
            lat: '=',
            lng: '=',
            events: '=?',
            trackBy: '=?',
            pushpinData: '=?',
            fontIcon: '=?',
            fontIconSize: '=?'
        },
        require: '^bingMap'
    };

}

angular.module('angularBingMaps.directives').directive('pushpin', pushpinDirective);
