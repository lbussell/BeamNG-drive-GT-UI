// deno-lint-ignore-file

angular.module("beamng.apps").directive("simpleAnalogTach", () => {
    const directive = {
        template:
            '<object style="width:100%; height:100%; box-sizing:border-box; pointer-events: none" type="image/svg+xml" data="/ui/modules/apps/SimpleAnalogTach/tach.svg"></object>',
        replace: true,
        restrict: "EA",
        link: (scope, element, attrs) => {
            "use strict";

            const streams = ["engineInfo"];
            StreamsManager.add(streams);
            scope.$on("$destroy", () => StreamsManager.remove(streams));

            const startAngle = -135;
            const endAngle = 135;

            element.on("load", () => {
                var svg = element[0].contentDocument;

                const setDisplayInfoText = (streams) => {
                    const idleRpm = streams.engineInfo[0];
                    const maxRpm = streams.engineInfo[1];
                    const currentRpm = streams.engineInfo[4].toFixed();
                    const gear = streams.engineInfo[16];
                    svg.getElementById("tspan13-8-1-6").innerHTML = idleRpm;
                    svg.getElementById("tspan13-8-2").innerHTML = maxRpm;
                    svg.getElementById("tspan13-3").innerHTML = currentRpm;
                    svg.getElementById("tspan13-8-1-2-5").innerHTML = gear;
                }

                const centerDot = svg.getElementById("center-dot");
                const rotationCenter = {
                    cx: centerDot.getAttribute("cx"),
                    cy: centerDot.getAttribute("cy"),
                };

                const setNeedlePos = (degrees) => {
                    const needle = svg.getElementById("needle");
                    needle.setAttribute(
                        "transform",
                        `rotate(${degrees},${rotationCenter.cx},${rotationCenter.cy})`);
                };

                const map = (minRpm, maxRpm, n) => {
                    const pct = n / (maxRpm - minRpm);
                    const interval = endAngle - startAngle;
                    const angle = interval * pct;
                    return startAngle + angle;
                }

                scope.$on('streamsUpdate', (event, streams) => {
                    if (!streams.engineInfo) {
                        return;
                    }

                    setDisplayInfoText(streams);
                    const needleAngle = map(0, streams.engineInfo[1], streams.engineInfo[4])
                    setNeedlePos(needleAngle);
                });
            });
        }
    };

    return directive;
});
