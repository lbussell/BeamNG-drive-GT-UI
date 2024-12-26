// deno-lint-ignore-file

angular.module('beamng.apps').directive('gt4Gforce', () => {
    "use strict";

    const config = {
        indicatorId: 'gt4-g-indicator',
    }

    const link = (scope, element, attrs) => {
        const streams = ["sensors"];
        StreamsManager.add(streams);
        scope.$on("$destroy", () => StreamsManager.remove(streams));

        const indicator = document.getElementById(config.indicatorId);
        const mapToGRange = g => {
            if (g < -2) {
                g = -2;
            } else if (g > 2) {
                g = 2;
            }

            return ((-g + 2) / 4) * 100;
        }

        const applyG = pct => {
            indicator.style.left = `${pct}%`;
        }

        scope.$on('streamsUpdate', (event, streams) => {
            if (!streams.sensors) {
                return;
            }

            const rawGravity = streams.sensors.gravity;

            const gravity = rawGravity >= 0
                ? Math.max(0.1, rawGravity)
                : Math.min(-0.1, rawGravity);

            const gx = streams.sensors.gx2 / gravity;
            applyG(mapToGRange(gx));
        });
    }

    const directive = {
        templateUrl: '/ui/modules/apps/GT4_GForce/app.html',
        replace: true,
        restrict: 'EA',
        link: link
    };

    return directive;
});
