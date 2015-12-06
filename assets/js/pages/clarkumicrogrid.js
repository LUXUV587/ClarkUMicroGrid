var PageCharts = function () {
    // Flot charts, for more examples you can check out http://www.flotcharts.org/flot/examples/
    var initChartsFlot = function () {

        // Get the elements where we will attach the charts
        var $flotLive = jQuery('.js-flot-live');
        // Live Chart      
        var $dataLive = [];

        var $dataurl = "assets/php/query.php";

        var $querydata = [];

        function getRandomData() { // Random data generator

            if ($dataLive.length > 0)
                $dataLive = $dataLive.slice(1);
            ////dsfdsfsafa
            while ($dataLive.length < 300) {
                var prev = $dataLive.length > 0 ? $dataLive[$dataLive.length - 1] : 50;
                var y = prev + Math.random() * 10 - 5;
                if (y < 0)
                    y = 0;
                if (y > 100)
                    y = 100;
                $dataLive.push(y);
            }

            var res = [];
            for (var i = 0; i < $dataLive.length; ++i)
                res.push([i, $dataLive[i]]);

            // Show live chart info
            jQuery('.js-flot-live-info').html(y.toFixed(0) + ' W');

            return res;
        }

        var $dataLive2 = [[], []];

        function getRandomData2() { // Random data generator
            if ($dataLive2[0].length > 0) {
                $dataLive2[0] = $dataLive2[0].slice(1);
                $dataLive2[1] = $dataLive2[1].slice(1);
            }

            while ($dataLive2[0].length < 300) {
                var prev = $dataLive2[0].length > 0 ? $dataLive2[0][$dataLive2[0].length - 1] : 50;
                var y = prev + Math.random() * 10 - 5;
                if (y < 0)
                    y = 0;
                if (y > 100)
                    y = 100;
                $dataLive2[0].push(y);
                $dataLive2[1].push(100 - y);
            }
            var series1 = {
                label: "output",
                data: []
            };
            var series2 = {
                label: "input",
                data: []
            };
            var data = [series1, series2];
            for (var i = 0; i < $dataLive2[0].length; ++i) {
                data[0].data.push([i, $dataLive2[0][i]]);
                data[1].data.push([i, $dataLive2[1][i]]);
            }

            // Show live chart info
            jQuery('.js-flot-live-info').html(y.toFixed(0) + ' W');

            return data;
        }

        function getRandomData3(timenow) { // Random data generator x axis is time
            if ($dataLive2[0].length > 0) {
                $dataLive2[0] = $dataLive2[0].slice(1);
                $dataLive2[1] = $dataLive2[1].slice(1);
            }

            while ($dataLive2[0].length < 300) {
                var prev = $dataLive2[0].length > 0 ? $dataLive2[0][$dataLive2[0].length - 1] : 50;
                var y = prev + Math.random() * 10 - 5;
                if (y < 0)
                    y = 0;
                if (y > 100)
                    y = 100;
                $dataLive2[0].push(y);
                $dataLive2[1].push(100 - y);
            }
            var series1 = {
                label: "output",
                data: []
            };
            var series2 = {
                label: "input",
                data: []
            };
            var updatedata = [series1, series2];
            //push the update array into the new array
            for (var i = 0; i < $dataLive2[0].length; ++i) {
                updatedata[0].data.push([i * 100 + timenow, $dataLive2[0][i]]);
                updatedata[1].data.push([i * 100 + timenow, $dataLive2[1][i]]);
            }
            // Show live chart info
            jQuery('.js-flot-live-info').html(y.toFixed(0) + ' W');

            return updatedata;
        }

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
                    label: "output",
                    data: []
                };

                var series2 = {
                    label: "input",
                    data: []
                };

                var updatedata = [series1]; //, series2];

                var index = Math.floor(timenow / 100);

                for (var i = 0; i < 300; ++i) {
                    updatedata[0].data.push([i * 100 + timenow, $querydata[(index + i) % 1440]["PVpow"]]);
                    //updatedata[1].data.push([i * 100 + timenow, $querydata[(index+i)%1440]["OutPow"]]);
                }
                document.getElementById("solarvolts").value = $querydata[(index + 299) % 1440]["Pvvolts"];
                document.getElementById("solarcur").value = $querydata[(index + 299) % 1440]["Pvcur"];
                document.getElementById("outputvolts").value = $querydata[(index + 299) % 1440]["OutCur"];
                document.getElementById("outputcur").value = $querydata[(index + 299) % 1440]["OutV"];
                document.getElementById("batteryvoltage").value = $querydata[(index + 299) % 1440]["BattV"];
                var keys = Object.keys($querydata[0]);
                document.getElementById("batterycur").value = keys[1];
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
                max: timenow + 29900,
                twelveHourClock: false
            }
        };

        var timenow = Date.now();

        function updateChartLive() { // Update live chart


            timenow = timenow + 100;
            $chartLive.getAxes().xaxis.options.min = timenow;
            $chartLive.getAxes().xaxis.options.max = timenow + 29900;
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
    };

    var initintraday = function () {
        var chartData = generateChartData();

        var chart = AmCharts.makeChart("intradaychartdiv", {
            "type": "serial",
            "theme": "light",
            "marginRight": 80,
            //"dataProvider": chartData,
            "dataLoader": {
                "url": "assets/php/query.php"
            },
            "valueAxes": [{
                "position": "left",
                "title": "Output Power"
            }],
            "graphs": [{
                "id": "g1",
                "valueField": "PVpow",
                "balloonText": "<div style='margin:5px; font-size:19px;'><b>[[value]] W</b></div>"
            }, {
                "id": "g2",
                "valueField": "input",
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
                "categoryBalloonDateFormat": "JJ:NN, DD MM YYYY",
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

        chart.addListener("dataUpdated", zoomChart);
        // when we apply theme, the dataUpdated event is fired even before we add listener, so
        // we need to call zoomChart here
        zoomChart();
        // this method is called when chart is first inited as we listen for "dataUpdated" event
        function zoomChart() {
            // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
            chart.zoomToIndexes(chartData.length - 250, chartData.length - 100);
        }

        // generate some random data, quite different range
        function generateChartData() {
            var chartData = [];
            // current date
            var firstDate = new Date();
            // now set 500 minutes back
            firstDate.setMinutes(firstDate.getDate() - 1000);

            // and generate 500 data items
            for (var i = 0; i < 500; i++) {
                var newDate = new Date(firstDate);
                // each time we add one minute
                newDate.setMinutes(newDate.getMinutes() + i);
                // some random number
                var output = Math.round(Math.random() * 40 + 10 + i + Math.random() * i / 5);
                var input = 1000 - output;
                // add data item to the array
                chartData.push({
                    date: newDate,
                    output: output,
                    input: input
                });
            }
            return chartData;
        }
    };

    var initdailyaverage = function () {
        var chart = AmCharts.makeChart("dailyaveragechartdiv", {
            "type": "serial",
            "theme": "light",
            "marginRight": 80,
            "autoMarginOffset": 20,
            "dataDateFormat": "YYYY-MM-DD",
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left"
            }],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": [{
                "id": "g1",
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": "red line",
                "useLineColorForBulletBorder": true,
                "valueField": "value",
                "balloonText": "<div style='margin:5px; font-size:19px;'><span style='font-size:13px;'>[[category]]</span><br>[[value]]</div>"
            }],
            "chartScrollbar": {
                "graph": "g1",
                "oppositeAxis": false,
                "offset": 30,
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
                "pan": true,
                "valueLineEnabled": true,
                "valueLineBalloonEnabled": true,
                "cursorAlpha": 0,
                "valueLineAlpha": 0.2
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "dashLength": 1,
                "minorGridEnabled": true
            },
            "export": {
                "enabled": true
            },
            "dataProvider": [{
                "date": "2012-07-27",
                "value": 13
            }, {
                "date": "2012-07-28",
                "value": 11
            }, {
                "date": "2012-07-29",
                "value": 15
            }, {
                "date": "2012-07-30",
                "value": 16
            }, {
                "date": "2012-07-31",
                "value": 18
            }, {
                "date": "2012-08-01",
                "value": 13
            }, {
                "date": "2012-08-02",
                "value": 22
            }, {
                "date": "2012-08-03",
                "value": 23
            }, {
                "date": "2012-08-04",
                "value": 20
            }, {
                "date": "2012-08-05",
                "value": 17
            }, {
                "date": "2012-08-06",
                "value": 16
            }, {
                "date": "2012-08-07",
                "value": 18
            }, {
                "date": "2012-08-08",
                "value": 21
            }, {
                "date": "2012-08-09",
                "value": 26
            }, {
                "date": "2012-08-10",
                "value": 24
            }, {
                "date": "2012-08-11",
                "value": 29
            }, {
                "date": "2012-08-12",
                "value": 32
            }, {
                "date": "2012-08-13",
                "value": 18
            }, {
                "date": "2012-08-14",
                "value": 24
            }, {
                "date": "2012-08-15",
                "value": 22
            }, {
                "date": "2012-08-16",
                "value": 18
            }, {
                "date": "2012-08-17",
                "value": 19
            }, {
                "date": "2012-08-18",
                "value": 14
            }, {
                "date": "2012-08-19",
                "value": 15
            }, {
                "date": "2012-08-20",
                "value": 12
            }, {
                "date": "2012-08-21",
                "value": 8
            }, {
                "date": "2012-08-22",
                "value": 9
            }, {
                "date": "2012-08-23",
                "value": 8
            }, {
                "date": "2012-08-24",
                "value": 7
            }, {
                "date": "2012-08-25",
                "value": 5
            }, {
                "date": "2012-08-26",
                "value": 11
            }, {
                "date": "2012-08-27",
                "value": 13
            }, {
                "date": "2012-08-28",
                "value": 18
            }, {
                "date": "2012-08-29",
                "value": 20
            }, {
                "date": "2012-08-30",
                "value": 29
            }, {
                "date": "2012-08-31",
                "value": 33
            }, {
                "date": "2012-09-01",
                "value": 42
            }, {
                "date": "2012-09-02",
                "value": 35
            }, {
                "date": "2012-09-03",
                "value": 31
            }, {
                "date": "2012-09-04",
                "value": 47
            }, {
                "date": "2012-09-05",
                "value": 52
            }, {
                "date": "2012-09-06",
                "value": 46
            }, {
                "date": "2012-09-07",
                "value": 41
            }, {
                "date": "2012-09-08",
                "value": 43
            }, {
                "date": "2012-09-09",
                "value": 40
            }, {
                "date": "2012-09-10",
                "value": 39
            }, {
                "date": "2012-09-11",
                "value": 34
            }, {
                "date": "2012-09-12",
                "value": 29
            }, {
                "date": "2012-09-13",
                "value": 34
            }, {
                "date": "2012-09-14",
                "value": 37
            }, {
                "date": "2012-09-15",
                "value": 42
            }, {
                "date": "2012-09-16",
                "value": 49
            }, {
                "date": "2012-09-17",
                "value": 46
            }, {
                "date": "2012-09-18",
                "value": 47
            }, {
                "date": "2012-09-19",
                "value": 55
            }, {
                "date": "2012-09-20",
                "value": 59
            }, {
                "date": "2012-09-21",
                "value": 58
            }, {
                "date": "2012-09-22",
                "value": 57
            }, {
                "date": "2012-09-23",
                "value": 61
            }, {
                "date": "2012-09-24",
                "value": 59
            }, {
                "date": "2012-09-25",
                "value": 67
            }, {
                "date": "2012-09-26",
                "value": 65
            }, {
                "date": "2012-09-27",
                "value": 61
            }, {
                "date": "2012-09-28",
                "value": 66
            }, {
                "date": "2012-09-29",
                "value": 69
            }, {
                "date": "2012-09-30",
                "value": 71
            }, {
                "date": "2012-10-01",
                "value": 67
            }, {
                "date": "2012-10-02",
                "value": 63
            }, {
                "date": "2012-10-03",
                "value": 46
            }, {
                "date": "2012-10-04",
                "value": 32
            }, {
                "date": "2012-10-05",
                "value": 21
            }, {
                "date": "2012-10-06",
                "value": 18
            }, {
                "date": "2012-10-07",
                "value": 21
            }, {
                "date": "2012-10-08",
                "value": 28
            }, {
                "date": "2012-10-09",
                "value": 27
            }, {
                "date": "2012-10-10",
                "value": 36
            }, {
                "date": "2012-10-11",
                "value": 33
            }, {
                "date": "2012-10-12",
                "value": 31
            }, {
                "date": "2012-10-13",
                "value": 30
            }, {
                "date": "2012-10-14",
                "value": 34
            }, {
                "date": "2012-10-15",
                "value": 38
            }, {
                "date": "2012-10-16",
                "value": 37
            }, {
                "date": "2012-10-17",
                "value": 44
            }, {
                "date": "2012-10-18",
                "value": 49
            }, {
                "date": "2012-10-19",
                "value": 53
            }, {
                "date": "2012-10-20",
                "value": 57
            }, {
                "date": "2012-10-21",
                "value": 60
            }, {
                "date": "2012-10-22",
                "value": 61
            }, {
                "date": "2012-10-23",
                "value": 69
            }, {
                "date": "2012-10-24",
                "value": 67
            }, {
                "date": "2012-10-25",
                "value": 72
            }, {
                "date": "2012-10-26",
                "value": 77
            }, {
                "date": "2012-10-27",
                "value": 75
            }, {
                "date": "2012-10-28",
                "value": 70
            }, {
                "date": "2012-10-29",
                "value": 72
            }, {
                "date": "2012-10-30",
                "value": 70
            }, {
                "date": "2012-10-31",
                "value": 72
            }, {
                "date": "2012-11-01",
                "value": 73
            }, {
                "date": "2012-11-02",
                "value": 67
            }, {
                "date": "2012-11-03",
                "value": 68
            }, {
                "date": "2012-11-04",
                "value": 65
            }, {
                "date": "2012-11-05",
                "value": 71
            }, {
                "date": "2012-11-06",
                "value": 75
            }, {
                "date": "2012-11-07",
                "value": 74
            }, {
                "date": "2012-11-08",
                "value": 71
            }, {
                "date": "2012-11-09",
                "value": 76
            }, {
                "date": "2012-11-10",
                "value": 77
            }, {
                "date": "2012-11-11",
                "value": 81
            }, {
                "date": "2012-11-12",
                "value": 83
            }, {
                "date": "2012-11-13",
                "value": 80
            }, {
                "date": "2012-11-14",
                "value": 81
            }, {
                "date": "2012-11-15",
                "value": 87
            }, {
                "date": "2012-11-16",
                "value": 82
            }, {
                "date": "2012-11-17",
                "value": 86
            }, {
                "date": "2012-11-18",
                "value": 80
            }, {
                "date": "2012-11-19",
                "value": 87
            }, {
                "date": "2012-11-20",
                "value": 83
            }, {
                "date": "2012-11-21",
                "value": 85
            }, {
                "date": "2012-11-22",
                "value": 84
            }, {
                "date": "2012-11-23",
                "value": 82
            }, {
                "date": "2012-11-24",
                "value": 73
            }, {
                "date": "2012-11-25",
                "value": 71
            }, {
                "date": "2012-11-26",
                "value": 75
            }, {
                "date": "2012-11-27",
                "value": 79
            }, {
                "date": "2012-11-28",
                "value": 70
            }, {
                "date": "2012-11-29",
                "value": 73
            }, {
                "date": "2012-11-30",
                "value": 61
            }, {
                "date": "2012-12-01",
                "value": 62
            }, {
                "date": "2012-12-02",
                "value": 66
            }, {
                "date": "2012-12-03",
                "value": 65
            }, {
                "date": "2012-12-04",
                "value": 73
            }, {
                "date": "2012-12-05",
                "value": 79
            }, {
                "date": "2012-12-06",
                "value": 78
            }, {
                "date": "2012-12-07",
                "value": 78
            }, {
                "date": "2012-12-08",
                "value": 78
            }, {
                "date": "2012-12-09",
                "value": 74
            }, {
                "date": "2012-12-10",
                "value": 73
            }, {
                "date": "2012-12-11",
                "value": 75
            }, {
                "date": "2012-12-12",
                "value": 70
            }, {
                "date": "2012-12-13",
                "value": 77
            }, {
                "date": "2012-12-14",
                "value": 67
            }, {
                "date": "2012-12-15",
                "value": 62
            }, {
                "date": "2012-12-16",
                "value": 64
            }, {
                "date": "2012-12-17",
                "value": 61
            }, {
                "date": "2012-12-18",
                "value": 59
            }, {
                "date": "2012-12-19",
                "value": 53
            }, {
                "date": "2012-12-20",
                "value": 54
            }, {
                "date": "2012-12-21",
                "value": 56
            }, {
                "date": "2012-12-22",
                "value": 59
            }, {
                "date": "2012-12-23",
                "value": 58
            }, {
                "date": "2012-12-24",
                "value": 55
            }, {
                "date": "2012-12-25",
                "value": 52
            }, {
                "date": "2012-12-26",
                "value": 54
            }, {
                "date": "2012-12-27",
                "value": 50
            }, {
                "date": "2012-12-28",
                "value": 50
            }, {
                "date": "2012-12-29",
                "value": 51
            }, {
                "date": "2012-12-30",
                "value": 52
            }, {
                "date": "2012-12-31",
                "value": 58
            }, {
                "date": "2013-01-01",
                "value": 60
            }, {
                "date": "2013-01-02",
                "value": 67
            }, {
                "date": "2013-01-03",
                "value": 64
            }, {
                "date": "2013-01-04",
                "value": 66
            }, {
                "date": "2013-01-05",
                "value": 60
            }, {
                "date": "2013-01-06",
                "value": 63
            }, {
                "date": "2013-01-07",
                "value": 61
            }, {
                "date": "2013-01-08",
                "value": 60
            }, {
                "date": "2013-01-09",
                "value": 65
            }, {
                "date": "2013-01-10",
                "value": 75
            }, {
                "date": "2013-01-11",
                "value": 77
            }, {
                "date": "2013-01-12",
                "value": 78
            }, {
                "date": "2013-01-13",
                "value": 70
            }, {
                "date": "2013-01-14",
                "value": 70
            }, {
                "date": "2013-01-15",
                "value": 73
            }, {
                "date": "2013-01-16",
                "value": 71
            }, {
                "date": "2013-01-17",
                "value": 74
            }, {
                "date": "2013-01-18",
                "value": 78
            }, {
                "date": "2013-01-19",
                "value": 85
            }, {
                "date": "2013-01-20",
                "value": 82
            }, {
                "date": "2013-01-21",
                "value": 83
            }, {
                "date": "2013-01-22",
                "value": 88
            }, {
                "date": "2013-01-23",
                "value": 85
            }, {
                "date": "2013-01-24",
                "value": 85
            }, {
                "date": "2013-01-25",
                "value": 80
            }, {
                "date": "2013-01-26",
                "value": 87
            }, {
                "date": "2013-01-27",
                "value": 84
            }, {
                "date": "2013-01-28",
                "value": 83
            }, {
                "date": "2013-01-29",
                "value": 84
            }, {
                "date": "2013-01-30",
                "value": 81
            }]
        });

        chart.addListener("rendered", zoomChart);

        zoomChart();

        function zoomChart() {
            chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
        }
    };

    var initdatepicker = function () {
        $('#intradaydatepicker input').datepicker({
            startDate: "11/11/2015"
        });
        $('#dailyaveragedatepicker .input-daterange').datepicker({
            startDate: "11/11/2015"
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
            initdailyaverage();
            initdatepicker();
            initeasypiechart();
        }
    };
} ();

jQuery(function(){ PageCharts.init(); });