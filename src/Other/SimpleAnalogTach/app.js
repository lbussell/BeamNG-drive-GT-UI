// deno-lint-ignore-file

angular.module("beamng.apps").directive("simpleAnalogTach", () => {

    const StartAngle = -135;
    const EndAngle = 135;
    const idleRpmTspanId = "tspan13-8-1-6";
    const maxRpmTspanId = "tspan13-8-2";
    const currentRpmTspanId = "tspan13-3";
    const currentGearTspanId = "tspan13-8-1-2-5";

    const TachometerOptions = {
        startAngle: -135,
        endAngle: 135,
        centerElementId: "center-dot",
        idleRpmTspanId: "tspan13-8-1-6",
        maxRpmTspanId: "tspan13-8-2",
        currentRpmTspanId: "tspan13-3",
        currentGearTspanId: "tspan13-8-1-2-5",
        tickMarkGroupId: "tick-marks",
        largeTickTemplateId: "lg",
        mediumTickTemplateId: "md",
        smallTickTemplateId: "sm",
        smallTicks: 4,
        needleId: "needle",
    };

    const getMaxRpm = redline => {
        // Examples:
        // 5600 redline -> tach limit should be 7000
        // 5000 redline -> tach limit should be 6000
        const base = Math.floor(redline / 1000) * 1000;
        const add = redline % 1000 === 0 ? 1000 : 2000;
        return base + add;
    }

    const _rpmToAngle = (startAngle, endAngle) => (minRpm, maxRpm, currentRpm) => {
        const pct = currentRpm / (maxRpm - minRpm);
        const interval = endAngle - startAngle;
        const angle = interval * pct;
        return startAngle + angle;
    };

    const distributeTickMarks = (minRpm, maxRpm, smallTickMarksCount) => {
        const tickMarks = [];

        // Iterate from minRpm to maxRpm in steps of 1000 for large tick marks
        for (let rpm = minRpm; rpm <= maxRpm; rpm += 1000) {
            // Add the large tick mark
            tickMarks.push({ type: 'lg', rpm });

            // Add the medium tick mark if it's not at the maxRpm
            if (rpm + 500 <= maxRpm) {
                tickMarks.push({ type: 'md', rpm: rpm + 500 });
            }

            // Add small tick marks between large and medium tick marks
            const smallTickInterval = 500 / (smallTickMarksCount + 1);
            for (let i = 1; i <= smallTickMarksCount; i++) {
                const smallTickRpm = rpm + i * smallTickInterval;
                if (smallTickRpm < rpm + 500 && smallTickRpm <= maxRpm) {
                    tickMarks.push({ type: 'sm', rpm: smallTickRpm });
                }
            }

            // Add small tick marks between medium and next large tick marks
            for (let i = 1; i <= smallTickMarksCount; i++) {
                const smallTickRpm = rpm + 500 + i * smallTickInterval;
                if (smallTickRpm < rpm + 1000 && smallTickRpm <= maxRpm) {
                    tickMarks.push({ type: 'sm', rpm: smallTickRpm });
                }
            }
        }

        return tickMarks;
    }

    const createTachometer = (tachOptions, svg, initialStream) =>
    {
        var tickMarks = 0;

        const tickMarkGroup = svg.getElementById(tachOptions.tickMarkGroupId);
        const lgTickMark = svg.getElementById(tachOptions.largeTickTemplateId);
        const mdTickMark = svg.getElementById(tachOptions.mediumTickTemplateId);
        const smTickMark = svg.getElementById(tachOptions.smallTickTemplateId);
        const center = svg.getElementById(tachOptions.centerElementId);
        const needle = svg.getElementById(tachOptions.needleId);

        const idleRpm = initialStream.engineInfo[0];
        const redlineRpm = initialStream.engineInfo[1];
        const minRpm = 0;
        const maxRpm = getMaxRpm(redlineRpm);

        const rotationCenter = {
            cx: center.getAttribute("cx"),
            cy: center.getAttribute("cy"),
        };

        const rpmToAngle = _rpmToAngle(StartAngle, EndAngle);

        const createTickMark = (tick) => {
            const templateTickMark =
                tick.type === "sm" ? smTickMark
                : tick.type === "md" ? mdTickMark
                : lgTickMark;
            const newTickMark = templateTickMark.cloneNode(true);
            newTickMark.setAttribute("id", `tick${tickMarks}`);
            newTickMark.style.display = "";
            tickMarkGroup.appendChild(newTickMark);
            const degrees = rpmToAngle(minRpm, maxRpm, tick.rpm);
            newTickMark.setAttribute( "transform", `rotate(${degrees},${rotationCenter.cx},${rotationCenter.cy})`);
         };

        const createTickMarks = () => {
            const tickMarks = distributeTickMarks(minRpm, maxRpm, tachOptions.smallTicks);
            tickMarks.forEach(createTickMark);
        };

        const updateDisplayInfoText = (currentRpm, gear) => {
            // svg.getElementById(currentRpmTspanId).innerHTML = currentRpm;
            // svg.getElementById(currentGearTspanId).innerHTML = gear;
        };

        const updateNeedleAngle = (currentRpm) => {
            const needleAngle = rpmToAngle(minRpm, maxRpm, currentRpm);
            needle.setAttribute(
                "transform",
                `rotate(${needleAngle},${rotationCenter.cx},${rotationCenter.cy})`);
        };

        const update = streams => {
            const currentRpm = streams.engineInfo[4].toFixed();
            const gear = streams.engineInfo[16];

            updateNeedleAngle(currentRpm);
            updateDisplayInfoText(currentRpm, gear);
        }

        createTickMarks();

        return {
            update: update,
        };
    };

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

            element.on("load", () => {
                const svg = element[0].contentDocument;
                var tachometer = undefined;

                scope.$on('streamsUpdate', (event, streams) => {
                    if (!streams.engineInfo) {
                        return;
                    }

                    if (!tachometer) {
                        tachometer = createTachometer(TachometerOptions, svg, streams);
                    }

                    tachometer.update(streams);
                });
            });
        }
    };

    return directive;
});
