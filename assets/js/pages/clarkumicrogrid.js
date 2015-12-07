var PageCharts = function () {
    // Flot charts, for more examples you can check out http://www.flotcharts.org/flot/examples/
    var initChartsFlot = function () {

        // Get the elements where we will attach the charts
        var $flotLive = jQuery('.js-flot-live');
        // Live Chart      
        var $dataLive = [];

        var $dataurl = "assets/php/queryrealtime.php";

        var $querydata = [];

        var $parameter1 = "PVVolts";

        var $parameter2 = "";

        var $paradict = { "PVVolts": "PV Volts",
            "PVCur": "PV Currents",
            "PVPow": "PV Power",
            "OutVolts": "Output Volts",
            "OutCur": "Output Currents",
            "OutPow": "Output Power",
            "BattV": "Battery Volts",
            "Wind": "Wind"
        };

        var $timeperiod1 = 300;

        var $unitsdict = { "PVVolts": "Volts",
            "PVCur": "Amperes",
            "PVPow": "Watts",
            "OutVolts": "Volts",
            "OutCur": "Amperes",
            "OutPow": "Watts",
            "BattV": "Volts",
            "Wind": "m/s"
        };

        function getTableData(timenow) {

            updatedata = [];

            if ($querydata.length == 0) {

                function onDataReceived(series) {
                    $querydata = series;
                }

                $.ajax({
                    url: $dataurl,
                    type: "GET",
                    dataType: "json",
                    success: onDataReceived
                });
            }
            else {
                var series1 = {
                    label: $paradict[$parameter1],
                    data: []
                };

                var index = Math.floor(timenow / 100);

                if ($parameter2 == "") {
                    var updatedata = [series1];

                    for (var i = 0; i < $timeperiod1; ++i) {
                        updatedata[0].data.push([i * 100 + timenow, $querydata[(index + i) % 1440][$parameter1]]);
                    }
                }
                else {
                    var series2 = {
                        label: $paradict[$parameter2],
                        data: []
                    };

                    var updatedata = [series1, series2];

                    for (var i = 0; i < $timeperiod1; ++i) {
                        updatedata[0].data.push([i * 100 + timenow, $querydata[(index + i) % 1440][$parameter1]]);
                        updatedata[1].data.push([i * 100 + timenow, $querydata[(index + i) % 1440][$parameter2]]);
                    }
                }

                var maxpower = 300.0;

                //PV info
                document.getElementById("solarvolts").value = $querydata[(index + 299) % 1440]["PVVolts"];
                document.getElementById("solarcur").value = $querydata[(index + 299) % 1440]["PVCur"];
                document.getElementById("solarpow").value = $querydata[(index + 299) % 1440]["PVPow"];
                var chart = window.chart = $('#pvpiechart .chart').data('easyPieChart');
                chart.update(Math.round($querydata[(index + 299) % 1440]["PVPow"] / maxpower * 100));
                document.getElementById("pvper").innerHTML = Math.round($querydata[(index + 299) % 1440]["PVPow"] / maxpower * 100);

                //Output info
                document.getElementById("outputvolts").value = $querydata[(index + 299) % 1440]["OutVolts"];
                document.getElementById("outputcur").value = $querydata[(index + 299) % 1440]["OutCur"];
                document.getElementById("outputpow").value = $querydata[(index + 299) % 1440]["OutPow"];
                var chart = window.chart = $('#outputpiechart .chart').data('easyPieChart');
                chart.update(Math.round($querydata[(index + 299) % 1440]["OutPow"] / maxpower * 100));
                document.getElementById("outputper").innerHTML = Math.round($querydata[(index + 299) % 1440]["OutPow"] / maxpower * 100);

                //Output info
                document.getElementById("batteryvoltage").value = $querydata[(index + 299) % 1440]["BattV"];
                var chart = window.chart = $('#batterypiechart .chart').data('easyPieChart');
                chart.update(Math.round($querydata[(index + 299) % 1440]["BattV"] / 48.0 * 100));
                document.getElementById("batteryper").innerHTML = Math.round($querydata[(index + 299) % 1440]["BattV"] / 48.0 * 100);

                var keys = Object.keys($querydata[0]);
                document.getElementById("realtime").innerHTML = $querydata[(index + 299) % 1440]["date_time"];
            }

            return updatedata;

        }

        var options = {
            legend: { show: true, position: "nw" },
            grid: { hoverable: true },
            xaxis: { show: true,
                mode: "time",
                tickSize: [10, "second"],
                min: timenow,
                max: timenow + ($timeperiod1 - 1) * 100,
                twelveHourClock: false
            }
        };

        var timenow = Date.now();

        function updateChartLive() { // Update live chart


            timenow = timenow + 100;
            $chartLive.getAxes().xaxis.options.min = timenow;
            $chartLive.getAxes().xaxis.options.max = timenow + ($timeperiod1 - 1) * 100;
            $chartLive.setData(getTableData(timenow));
            $chartLive.setupGrid();
            $chartLive.draw();
            setTimeout(updateChartLive, 100);
        }

        var $chartLive = jQuery.plot($flotLive, getTableData(timenow), options); // Init live chart

        updateChartLive(); // Start getting new data

        var $resizeableblock = jQuery('.resizeableblock');

        $flotLive.resize(function () {
            $flotLive.css('height', $resizeableblock.height() - 140);
            $chartLive = jQuery.plot($flotLive, getTableData(timenow), options);
        });

        document.getElementById("parameter1").addEventListener("change", function () {
            $parameter1 = document.getElementById("parameter1").value;
            document.getElementById("units1").innerHTML = $unitsdict[$parameter1];
        });

        document.getElementById("parameter2").addEventListener("change", function () {
            $parameter2 = document.getElementById("parameter2").value;
            document.getElementById("units2").innerHTML = $unitsdict[$parameter2];
        });

        document.getElementById("timeperiod1").addEventListener("change", function () {
            $timeperiod1 = document.getElementById("timeperiod1").value;
        });
    };

    var initintraday = function () {
        var $meanparameter = "PVVolts"

        var $paradict = { "PVVolts": "PV Volts",
            "PVCur": "PV Currents",
            "PVPow": "PV Power",
            "OutVolts": "Output Volts",
            "OutCur": "Output Currents",
            "OutPow": "Output Power",
            "BattV": "Battery Volts",
            "Wind": "Wind"
        };

        var chart = AmCharts.makeChart("intradaychartdiv", {
            "type": "serial",
            "theme": "light",
            "marginRight": 80,
            "dataLoader": {
                "url": "assets/php/queryintraday.php"
            },
            "valueAxes": [{
                "position": "left",
                "title": $paradict[$meanparameter]
            }],
            "graphs": [{
                "id": "g1",
                "valueField": $meanparameter,
                "balloonText": "<div style='margin:5px; font-size:19px;'><b>[[value]] W</b></div>"
            }],
            "chartScrollbar": {
                "graph": "g1",
                "scrollbarHeight": 80,
                "backgroundAlpha": 0,
                "selectedBackgroundAlpha": 0.1,
                "selectedBackgroundColor": "#888888",
                "graphFillAlpha": 0,
                "graphLineAlpha": 0.5,
                "selectedGraphFillAlpha": 0,
                "selectedGraphLineAlpha": 1,
                "autoGridCount": true,
                "color": "#AAAAAA"
            },
            "chartCursor": {
                "categoryBalloonDateFormat": "YYYY MM DD JJ:NN",
                "cursorPosition": "mouse"
            },
            "categoryField": "date_time",
            "dataFormat": "YYYY-MM-DD JJ:NN:SS",
            "categoryAxis": {
                "minPeriod": "mm",
                "parseDates": true
            },
            "export": {
                "enabled": true
            }
        });

        document.getElementById("meanparameter").addEventListener("change", function () {
            $meanparameter = document.getElementById("meanparameter").value;
            chart.graphs[0]["valueField"] = $meanparameter;
            chart.valueAxes[0]["title"] = $paradict[$meanparameter];
            chart.validateData();
        });

        $('#intradaydatepicker input').datepicker({
            autoclose: true
        });
    };

    var initeasypiechart = function () {
        $('.chart').easyPieChart({
            //your configuration goes here
            size: 150,
            delay: 3000,
            barColor: '#69c',
            trackColor: '#ace',
            scaleColor: false,
            lineWidth: 20,
            lineCap: 'butt',
            trackWidth: 16
        });
    };

    return {
        init: function () {
            // Init all charts
            initChartsFlot();
            initintraday();
            initeasypiechart();
        }
    };
} ();

jQuery(function(){ PageCharts.init(); });