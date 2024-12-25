// deno-lint-ignore-file

angular.module('beamng.apps').directive('gt4Digital', () => {
    "use strict";

    const config = {
        parts: 40,
        speedId: 'gt4-speed',
        tachId: 'tach',
        tachElementId: 'bar-off',
        overagePct: 0.40,
    }

    let partsList = [];

    // -------------------------------------------------------------------------
    // lib
    // -------------------------------------------------------------------------

    const getSpeed = (streams) => {
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

    const getGearText = (streams) => {
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

    // -------------------------------------------------------------------------
    // app
    // -------------------------------------------------------------------------

    // let indicator = document.getElementById('shift-ind');
    const setRpm = (maxRpm, currentRpm) => {
        const maxTachRpm = maxRpm * (1 + config.overagePct);
        const partBoundary = currentRpm / maxTachRpm * config.parts;

        for (let i = 0; i < config.parts; i++) {
            if (i < partBoundary) {
                partsList[i].style.backgroundColor = '#CAE9F8FF';
            } else {
                partsList[i].style.backgroundColor = 'rgba(16,16,16,0.70)';
            }
        }
    }

    const link = (scope, element, attrs) => {
        const streams = ["electrics", "engineInfo"];
        StreamsManager.add(streams);
        scope.$on("$destroy", () => StreamsManager.remove(streams));

        partsList = [];
        const setup = () => {
            const tachContainer = document.getElementById(config.tachId);
            const tachElement = document.getElementById(config.tachElementId);

            for (let i = 0; i < config.parts; i++) {
                const copy = tachElement.cloneNode(true);
                partsList.push(copy);
                tachContainer.appendChild(copy);
            }

            tachElement.remove();
        };

        scope.$on(
            'SettingsChanged',
            (event, data) => scope.speedUiUnits = UiUnits.speed().unit);

        const speed = document.getElementById(config.speedId);
        scope.$on('streamsUpdate', (event, streams) => {
            if (!streams.electrics || !streams.engineInfo) {
                return;
            }

            // Update speed
            const speedUnits = getSpeed(streams);
            // console.log(speedUnits);
            if (speedUnits !== null) {
                speed.innerHTML = speedUnits;
            }

            // Update gear display
            scope.gear = getGearText(streams);

            // Update RPM
            const redlineRpm = streams.engineInfo[1];
            const currentRpm = streams.engineInfo[4].toFixed();
            setRpm(redlineRpm, currentRpm);

            // Update shift indicator
            if (currentRpm >= redlineRpm * 0.9) {
                scope.shiftIndicator = 'blinking-red';
            } else {
                scope.shiftIndicator = '';
            }
        });

        // I don't yet know why this is here
        bngApi.engineLua('settings.notifyUI()');

        setup();
    }

    const directive = {
        templateUrl: '/ui/modules/apps/GT4_Digital/app.html',
        replace: true,
        restrict: 'EA',
        link: link
    };

    return directive;
});
