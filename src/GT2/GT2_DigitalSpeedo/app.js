// deno-lint-ignore-file

angular.module('beamng.apps').directive('gt2DigitalSpeedo', [function () {
    return {
        template:
            '<object style="width:100%; height:100%; box-sizing:border-box; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/GT2_DigitalSpeedo/digital.svg"></object>',
        replace: true,
        restrict: 'EA',
        link: function(scope, element, attrs) {

            'use strict';

            // Register streams
            var streams = ['electrics', 'engineInfo'];
            StreamsManager.add(streams);
            scope.$on('$destroy', function() {
                StreamsManager.remove(streams);
            });

            element.on('load', function() {
                var svg = element[0].contentDocument;

                // When settings are changed, update the text for units
                scope.$on('SettingsChanged', function(event, data) {
                    svg.getElementById('tspan2').innerHTML = UiUnits.speed().unit;
                });

                // I don't yet know why this is here
                bngApi.engineLua('settings.notifyUI()');

                const getSpeed = function(streams) {
                    // Get speed in m/s from streams
                    var metersPerSecond = streams.electrics.wheelspeed;

                    // If speed is not available, then use airspeed
                    if (isNaN(metersPerSecond)) {
                        metersPerSecond = streams.electrics.airspeed;
                    }

                    // Convert speed to desired unit
                    var speedConverted = UiUnits.speed(metersPerSecond);
                    if(speedConverted === null) {
                        return null;
                    }

                    return Math.round(speedConverted.val);
                }

                const getGearText = function(streams) {
                    const gear = streams.engineInfo[16];

                    var gearText = '-';
                    if (gear > 0) {
                        // Normal gears
                        gearText = gear.toString();
                    } else if (gear < 0) {
                        // Reverse
                        gearText = 'R';
                    } else {
                        // Neutral
                        gearText = 'N';
                    }

                    return gearText;
                }

                scope.$on('streamsUpdate', function(event, streams) {
                    if (!streams.electrics || !streams.engineInfo) {
                        return;
                    }

                    // Update speed
                    const speedUnits = getSpeed(streams);
                    if (speedUnits !== null) {
                        svg.getElementById('tspan1').innerHTML = speedUnits;
                    }

                    // Update gear display
                    const gear = getGearText(streams);
                    svg.getElementById('tspan1-5').innerHTML = gear;
                });
            });
        }
    }
}]);
