// deno-lint-ignore-file

angular.module("beamng.apps").directive("simpleAnalogTach", () => {

    const getLargeRpmTicks = (minRpm, maxRpm) => {
        const result = Math.floor((maxRpm - minRpm) / 1000)
        return result;
    };

    function distributeEvenly(start, end, n) {
        const interval = (end - start) / (n - 1);
        const values = [];
        for (let i = 0; i < n; i++) {
            values.push(start + i * interval);
        }
        return values;
    }

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
                const svg = element[0].contentDocument;

                var initialized = false;
                const tickMarkGroup = svg.getElementById("tick-marks")
                const lgTickMark = svg.getElementById("lg");
                const mdTickMark = svg.getElementById("md");
                const smTickMark = svg.getElementById("sm");

                const centerDot = svg.getElementById("center-dot");
                const rotationCenter = {
                    cx: centerDot.getAttribute("cx"),
                    cy: centerDot.getAttribute("cy"),
                };

                var tickMarks = 0;

                const createTickMark = (degrees, templateTickMark) => {
                    const newTickMark = templateTickMark.cloneNode(true);

                    newTickMark.setAttribute("id", `tick${tickMarks}`);
                    tickMarks += 1;

                    tickMarkGroup.appendChild(newTickMark);
                    newTickMark.setAttribute(
                        "transform",
                        `rotate(${degrees},${rotationCenter.cx},${rotationCenter.cy})`);
                }

                const setTickMarks = (startAngle, endAngle,
                                      redlineRpm, maxRpm,
                                      lgTickMark, medTickMark, smallTickMark) => {
                    if (initialized) {
                        return;
                    }

                    const largeTickAngles = distributeEvenly(startAngle, endAngle, getLargeRpmTicks(0, maxRpm) + 1);
                    for (let i = 0; i < largeTickAngles.length; i++) {
                        createTickMark(largeTickAngles[i], lgTickMark);
                    }

                    initialized = true
                }

                const getMaxRpm = redline => {
                    // Examples:
                    // 5600 redline -> tach limit should be 7000
                    // 5000 redline -> tach limit should be 6000
                    const base = Math.floor(redline / 1000) * 1000;
                    const add = redline % 1000 === 0 ? 1000 : 2000;
                    return base + add;
                }

                const setDisplayInfoText = (streams) => {
                    const idleRpm = streams.engineInfo[0];
                    const redline = streams.engineInfo[1];
                    const maxRpm = getMaxRpm(redline);
                    const currentRpm = streams.engineInfo[4].toFixed();
                    const gear = streams.engineInfo[16];
                    svg.getElementById("tspan13-8-1-6").innerHTML = idleRpm;
                    svg.getElementById("tspan13-8-2").innerHTML = `${redline},${maxRpm}`;
                    svg.getElementById("tspan13-3").innerHTML = currentRpm;
                    svg.getElementById("tspan13-8-1-2-5").innerHTML = gear;
                };

                const setNeedlePos = (degrees) => {
                    const needle = svg.getElementById("needle");
                    needle.setAttribute(
                        "transform",
                        `rotate(${degrees},${rotationCenter.cx},${rotationCenter.cy})`);
                };

                const rpmToAngle = (minRpm, maxRpm, n) => {
                    const pct = n / (maxRpm - minRpm);
                    const interval = endAngle - startAngle;
                    const angle = interval * pct;
                    return startAngle + angle;
                }

                scope.$on('streamsUpdate', (event, streams) => {
                    if (!streams.engineInfo) {
                        return;
                    }

                    const redline = streams.engineInfo[1];
                    const minRpm = 0;
                    const maxRpm = getMaxRpm(redline);

                    setDisplayInfoText(streams);

                    const currentRpm = streams.engineInfo[4];
                    const needleAngle = rpmToAngle(minRpm, maxRpm, currentRpm)
                    setNeedlePos(needleAngle);

                    if (!initialized)
                    {
                        setTickMarks(startAngle, endAngle, redline, maxRpm, lgTickMark, mdTickMark, smTickMark);
                    }
                });
            });
        }
    };

    return directive;
});
