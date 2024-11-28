// deno-lint-ignore-file

const app = angular.module("beamng.apps");

app.directive("engineStreamDebug", () =>
{
    const directive =
    {
        template: '<div style="height:100%; width:100%;" class="bngApp">'
            // Unused: 9, 10, 14, 17
            + `0 - Idle RPM: {{ data.engineInfo[0].toFixed() }}<br>`
            + `1 - Max RPM: {{ data.engineInfo[1].toFixed() }}<br>`
            + `2 - Upshift RPM: {{ data.engineInfo[2].toFixed() }}<br>`
            + `3 - Downshift RPM: {{ data.engineInfo[3].toFixed() }}<br>`
            + `4 - RPM: {{ data.engineInfo[4].toFixed() }}<br>`
            + `5 - Gear (old): {{ data.engineInfo[5] }}<br>`
            + `6 - Forward Gears: {{ data.engineInfo[6] }}<br>`
            + `7 - Reverse Gears: {{ data.engineInfo[7] }}<br>`
            + `8 - Engine Torque: {{ data.engineInfo[8].toFixed() }}<br>`
            + `11 - Fuel1: {{ data.engineInfo[11].toFixed() }}<br>`
            + `12 - Fuel2: {{ data.engineInfo[12].toFixed() }}<br>`
            + `13 - Gearbox: {{ data.engineInfo[13] }}<br>`
            + `15 - BSFC: {{ data.engineInfo[15] }}<br>`
            + `16 - Gear: {{ data.engineInfo[16] }}<br>`
            + `18 - Load: {{ data.engineInfo[18].toFixed(2) }}<br>`
            + `19 - Wheel Torque: {{ data.engineInfo[19].toFixed() }}<br>`
            + `20 - Wheel Power: {{ data.engineInfo[20].toFixed() }}<br>`
            + `21 - Engine Power: {{ data.engineInfo[21].toFixed() }}<br>`
            + '</div>',
        replace: true,
        restrict: "EA",
        scope: true,
        controller:
        [
            "$log",
            "$scope",
            ($log, $scope) =>
            {
                "use strict";

                // Set up streams
                const streams = ["engineInfo"];
                StreamsManager.add(streams);
                $scope.$on("$destroy", () => StreamsManager.remove(streams));

                $scope.$on("streamsUpdate", (_, streams) =>
                {
                    $scope.$evalAsync(() =>
                    {
                        $scope.data = streams;
                    });
                });
            }
        ]
    }

    return directive;
});
