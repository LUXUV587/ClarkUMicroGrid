var PageCharts = function () {
    // Flot charts, for more examples you can check out http://www.flotcharts.org/flot/examples/
    var initChartsFlot = function () {

        // Get the elements where we will attach the charts
        var $flotLive = jQuery('.js-flot-live');
        // Live Chart      
        var $dataLive = [];

        var $dataurl = "assets/php/queryrealtime.php?query=";

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

        var $timeperiod2 = 300;

        var $countrows = 1000;

        var $indexrows = $timeperiod2;

        var $unitsdict = { "PVVolts": "Volts",
            "PVCur": "Amperes",
            "PVPow": "Watts",
            "OutVolts": "Volts",
            "OutCur": "Amperes",
            "OutPow": "Watts",
            "BattV": "Volts",
            "Wind": "m/s"
        };

        var $totalpv = 0;

        var $totaloutput = 0;

        function getTableData() {

            var updatedata = [];

            if ($querydata.length == 0) {

                function onDataReceived(series) {
                    $querydata = series;
                                    
                    for(i = 0, len = $querydata.length; i < len; i++) {
                        $totalpv += parseFloat($querydata[i]["PVPow"])*60.0/3600000.0;
                        $totaloutput += parseFloat($querydata[i]["OutPow"])*60.0/3600000.0;
                    }
                }

                $.ajax({
                    url: $dataurl + "SELECT * FROM monitoring_data order by id limit 300",
                    type: "GET",
                    dataType: "json",
                    success: onDataReceived
                });

                function onDataCount(series) {
                    $countrows = parseInt(series[0]["count"]);
                }

                $.ajax({
                    url: $dataurl + "SELECT COUNT(*) as count FROM monitoring_data",
                    type: "GET",
                    dataType: "json",
                    success: onDataCount
                });
            }
            else {

                while ($querydata.length > $timeperiod2) {
                    $querydata = $querydata.slice(1);
                }

                function onDataPush(series) {
                    $querydata.push(series[0]);
                }

                $.ajax({
                    url: $dataurl + 'SELECT * FROM monitoring_data ORDER BY id LIMIT ' + String($indexrows - 1) + ',1',
                    type: "GET",
                    dataType: "json",
                    success: onDataPush
                });

                var series1 = {
                    label: $paradict[$parameter1],
                    data: []
                };

                if ($parameter2 == "") {
                    updatedata = [series1];

                    for (var i = 0; i < $timeperiod2; ++i) {
                        updatedata[0].data.push([new Date($querydata[i]["date_time"]).getTime(), $querydata[i][$parameter1]]);
                    }
                }
                else {
                    var series2 = {
                        label: $paradict[$parameter2],
                        data: []
                    };

                    updatedata = [series1, series2];

                    for (var i = 0; i < $timeperiod2; ++i) {
                        updatedata[0].data.push([new Date($querydata[i]["date_time"]).getTime(), $querydata[i][$parameter1]]);
                        updatedata[1].data.push([new Date($querydata[i]["date_time"]).getTime(), $querydata[i][$parameter2]]);
                    }
                }

                var maxpower = 300.0;

                //PV info
                document.getElementById("solarvolts").value = $querydata[$timeperiod2 - 1]["PVVolts"];
                document.getElementById("solarcur").value = $querydata[$timeperiod2 - 1]["PVCur"];
                document.getElementById("solarpow").value = $querydata[$timeperiod2 - 1]["PVPow"];
                var chart = window.chart = $('#pvpiechart .chart').data('easyPieChart');
                chart.update(Math.round($querydata[$timeperiod2 - 1]["PVPow"] / maxpower * 100));
                document.getElementById("pvper").innerHTML = Math.round($querydata[$timeperiod2 - 1]["PVPow"] / maxpower * 100);

                //Output info
                document.getElementById("outputvolts").value = $querydata[$timeperiod2 - 1]["OutVolts"];
                document.getElementById("outputcur").value = $querydata[$timeperiod2 - 1]["OutCur"];
                document.getElementById("outputpow").value = $querydata[$timeperiod2 - 1]["OutPow"];
                var chart = window.chart = $('#outputpiechart .chart').data('easyPieChart');
                chart.update(Math.round($querydata[$timeperiod2 - 1]["OutPow"] / maxpower * 100));
                document.getElementById("outputper").innerHTML = Math.round($querydata[$timeperiod2 - 1]["OutPow"] / maxpower * 100);

                //Output info
                document.getElementById("batteryvoltage").value = $querydata[$timeperiod2 - 1]["BattV"];
                var chart = window.chart = $('#batterypiechart .chart').data('easyPieChart');
                chart.update(Math.round($querydata[$timeperiod2 - 1]["BattV"] / 48.0 * 100));
                document.getElementById("batteryper").innerHTML = Math.round($querydata[$timeperiod2 - 1]["BattV"] / 48.0 * 100);

                var keys = Object.keys($querydata[0]);
                document.getElementById("realtime").innerHTML = $querydata[$timeperiod2 - 1]["date_time"];
            }

            return updatedata;

        }

        var options = {
            legend: { show: true, position: "nw" },
            grid: { hoverable: true },
            xaxis: { show: true,
                mode: "time",
                timeformat: "%y/%m/%d %H:%M:%S",
                tickSize: [60, "minute"],
                timezone: "browser",
                min: 0, 
                max: 100,
                twelveHourClock: false
            }
        };

        function updateChartLive() { // Update live chart
            if ($querydata.length == 0) {
                getTableData();
                setTimeout(updateChartLive, 100);
            }
            else {
                $indexrows = ($indexrows + 1) % $countrows;

                $totalpv = $totalpv + parseFloat($querydata[$timeperiod2 - 1]["PVPow"])*60.0/3600000.0;
                $totaloutput = $totaloutput + parseFloat($querydata[$timeperiod2 - 1]["OutPow"])*60.0/3600000.0;

                document.getElementById("totalpv").innerHTML = $totalpv.toFixed(3);
                document.getElementById("totaloutput").innerHTML = $totaloutput.toFixed(3);

                xaxismin = new Date($querydata[$timeperiod2 - $timeperiod1]["date_time"]).getTime();
                xaxismax = new Date($querydata[$timeperiod2 - 1]["date_time"]).getTime();
                $chartLive.getAxes().xaxis.options.min = xaxismin;
                $chartLive.getAxes().xaxis.options.max = xaxismax;
                $chartLive.setData(getTableData());
                $chartLive.setupGrid();
                $chartLive.draw();
                setTimeout(updateChartLive, 100);
            }
        }

        var $chartLive = jQuery.plot($flotLive, getTableData(), options); // Init live chart

        updateChartLive(); // Start getting new data

        var $resizeableblock = jQuery('.resizeableblock');

        $flotLive.resize(function () {
            $flotLive.css('height', $resizeableblock.height() - 140);
            $chartLive = jQuery.plot($flotLive, getTableData(), options);
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
        var $meanparameter = "PVVolts";

        var $querydata = [];

        var $startdate = "2015-07-20";

        var $enddate = "2015-08-04";

        var $paradict = { "PVVolts": "PV Volts (V)",
            "PVCur": "PV Currents (A)",
            "PVPow": "PV Power (W)",
            "OutVolts": "Output Volts (V)",
            "OutCur": "Output Currents (A)",
            "OutPow": "Output Power (W)",
            "BattV": "Battery Volts (V)",
            "Wind": "Wind (m/s)"
        };

        $.getJSON('assets/php/querydaterange.php', function (jsonData) {
            $querydata = jsonData;
        })
        .done(function (data) {
            $startdate = $querydata[0]["start_date"];

            $enddate = $querydata[0]["end_date"];

            $('#intradaydatepicker input').datepicker("remove");

            intradaydatepicker();

            $chart = AmCharts.makeChart("intradaychartdiv", {
                "type": "serial",
                "theme": "light",
                "marginRight": 80,
                "dataLoader": {
                    "url": "assets/php/queryintraday.php?date=" + $querydata[0]["end_date"],
                    "format": "json"
                },
                "valueAxes": [{
                    "position": "left",
                    "title": $paradict[$meanparameter]
                }],
                "graphs": [{
                    "id": "g1",
                    "valueField": $meanparameter,
                    "balloonText": "<div style='margin:5px; font-size:19px;'><b>[[value]]</b></div>"
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
        });

        var $chart;

        document.getElementById("meanparameter").addEventListener("change", function () {
            $meanparameter = document.getElementById("meanparameter").value;
            $chart.graphs[0]["valueField"] = $meanparameter;
            $chart.valueAxes[0]["title"] = $paradict[$meanparameter];
            $chart.validateData();
        });

        intradaydatepicker();

        function intradaydatepicker() {
            $('#intradaydatepicker input').datepicker({
                startDate: $startdate,
                endDate: $enddate,
                autoclose: true
            })
            .on('changeDate', datechanged);

            function datechanged() {
                $(this).datepicker('hide');
                var date = $("#intraday-datepicker").val();
                $chart = AmCharts.makeChart("intradaychartdiv", {
                    "type": "serial",
                    "theme": "light",
                    "marginRight": 80,
                    "dataLoader": {
                        "url": "assets/php/queryintraday.php?date=" + date,
                        "format": "json"
                    },
                    "valueAxes": [{
                        "position": "left",
                        "title": $paradict[$meanparameter]
                    }],
                    "graphs": [{
                        "id": "g1",
                        "valueField": $meanparameter,
                        "balloonText": "<div style='margin:5px; font-size:19px;'><b>[[value]]</b></div>"
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
            }
        }

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