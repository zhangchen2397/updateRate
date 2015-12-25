(function() {
    var GAP = 12;
    var DATE_GAP = 60 * 60 * 24 * (GAP - 1) * 1000;
    var API = '/updateInfo';
    var WEB_ARR = ['腾讯', '新浪', '搜狐', '网易'];
    var CATEGORY_ARR = ['要闻', '财经', '娱乐', '体育'];
    var EMPTY_DATA = [];
    var LAST_DAY = +new Date() - 24 * 60 * 60 * 1000;

    for (var i = 0; i < GAP; i++) {
        EMPTY_DATA.push(0);
    }

    var chartOption = {
        tooltip: {
            trigger: 'axis'
        },
        toolbox: {
            show: true,
            feature: {
                mark: {
                    show: true
                },
                dataView: {
                    show: true,
                    readOnly: false
                },
                magicType: {
                    show: true,
                    type: ['line', 'bar']
                },
                restore: {
                    show: true
                },
                saveAsImage: {
                    show: true
                }
            }
        },
        calculable: true,
        xAxis: [{
            type: 'category',
            boundaryGap: false
        }],
        yAxis: [{
            type: 'value',
            axisLabel: {
                formatter: '{value}'
            }
        }]
    };

    var chartData = {
        dateList: [],
        cateList: {},
        webList: {},

        timeList: ['02:00', '04:00', '06:00', '08:00', '10:00', 
            '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'
        ],
        showTimeList: [],
        realtimeCateList: {}
    };

    var formatMap = {
        byweb: {
            data: 'cateList',
            key: 'category',
            eachArr: CATEGORY_ARR,
            chartTitle: '按网站各频道更新次数',
            id: 'chart-byweb',
            tableId: 'table-byweb',
            progressId: 'progress-byweb',
            type: 'day'
        },
        bycate: {
            data: 'webList',
            key: 'web',
            eachArr: WEB_ARR,
            chartTitle: '按频道各网站更新次数',
            id: 'chart-bycate',
            tableId: 'table-bycate',
            progressId: 'progress-bycate',
            type: 'day'
        },

        realtimeByweb: {
            data: 'realtimeCateList',
            key: 'category',
            eachArr: CATEGORY_ARR,
            chartTitle: '24小时更新趋势 - ' + moment(LAST_DAY).format('YYYY-MM-DD'),
            id: 'realtime-chart-byweb',
            tableId: 'realtime-table-byweb',
            progressId: 'progress-realtime-byweb',
            type: 'realtime'
        },
        realtimeBycate: {
            data: 'realtimeWebList',
            key: 'web',
            eachArr: WEB_ARR,
            chartTitle: '24小时更新趋势 - ' + moment(LAST_DAY).format('YYYY-MM-DD'),
            id: 'realtime-chart-bycate',
            tableId: 'realtime-table-bycate',
            progressId: 'progress-realtime-bycate',
            type: 'realtime'
        }
    };

    var pageRun = {
        init: function() {
            this.setDateList();
            this.setShowTimeList();

            this.getData({
                web: '腾讯',
                ftType: 'byweb'
            });

            this.getData({
                category: '要闻',
                ftType: 'bycate'
            });

            this.getData({
                web: '腾讯',
                type: 'realtime',
                ftType: 'realtimeByweb'
            });

            this.initEvent();
        },

        getData: function(options) {
            var me = this,
                options = options || {},
                type = options.type || 'day',
                date = options.date || moment(LAST_DAY - DATE_GAP).format('YYYY-MM-DD'),
                endDate = options.endDate || moment(LAST_DAY).format('YYYY-MM-DD'),
                web = options.web,
                category = options.category,
                ftType = options.ftType;

            var queryPara = {};

            if (ftType && (ftType == 'byweb' || ftType == 'bycate')) {
                queryPara.endDate = endDate;
            }

            if (type == 'realtime') {
                date = options.date || moment(LAST_DAY).format('YYYY-MM-DD');
            }

            queryPara.type = type;
            queryPara.date = date;

            web && (queryPara.web = web);
            category && (queryPara.category = category);

            $.ajax({
                url: API,
                data: queryPara
            }).done(function(data) {
                if (data.code == 0) {
                    me.formatData(data.list, ftType);
                    if (!options.noRenderTable) {
                        me.renderTable(ftType);
                    }
                    
                    if (!options.noRenderChart) {
                        me.renderChart(ftType);
                    }
                } else {
                    alert('系统错误，请重试');
                }
            }).fail(function() {
                alert('数据请求失败');
            });
        },

        formatData: function(data, type) {
            var ftType = formatMap[type],
                dataList = ftType.data,
                key = ftType.key,
                eachArr = ftType.eachArr,
                eachDateStr = 'dateList',
                dateFormatStr = 'MM/DD';

            if (ftType.type == 'realtime') {
                dateFormatStr = 'HH:mm';
                eachDateStr = 'timeList';
            }

            chartData[dataList] = {};

            $.each(chartData[eachDateStr], function(idx, val) {
                $.each(data, function(subIdx, subVal) {
                    var date = moment(subVal.date).format(dateFormatStr);
                    if (date == val) {
                        if (!chartData[dataList][subVal[key]]) {
                            chartData[dataList][subVal[key]] = [];
                        }
                        chartData[dataList][subVal[key]].push(date + '##' + subVal.updateCount);
                    }
                });
            });

            $.each(eachArr, function(idx, val) {
                if (!chartData[dataList][val]) {
                    chartData[dataList][val] = EMPTY_DATA;
                } else {
                    $.each(chartData[eachDateStr], function(dateIdx, dateVal) {
                        var hasMatch = false;
                        $.each(chartData[dataList][val], function(listIdx, listVal) {
                            var item = listVal.split('##');
                            if (dateVal == item[0]) {
                                hasMatch = true;
                                chartData[dataList][val][listIdx] = item[1];
                            }
                        });

                        if (!hasMatch) {
                            chartData[dataList][val].splice(dateIdx, 0, '0');
                        }
                    });

                    $.each(chartData[dataList][val], function(subIdx, subVal) {
                        chartData[dataList][val][subIdx] = parseInt(subVal, 10);
                    });
                }
            });
        },

        renderChart: function(type) {
            var chartType = formatMap[type],
                curChartData = null;

            var ftType = formatMap[type],
                eachDateStr = 'dateList';

            if (ftType.type == 'realtime') {
                eachDateStr = 'showTimeList';
            }

            var curChartData = {
                title: {
                    text: chartType.chartTitle
                },
                legend: {
                    data: []
                },
                xAxis: [{
                    data: chartData[eachDateStr]
                }],
                series: []
            };

            $.each(chartData[chartType.data], function(key, val) {
                curChartData.legend.data.push(key);
                curChartData.series.push({
                    name: key,
                    type: 'line',
                    data: val,
                    markPoint: {
                        data: [{
                            type: 'max',
                            name: '最大值'
                        }, {
                            type: 'min',
                            name: '最小值'
                        }]
                    },
                    markLine: {
                        data: [{
                            type: 'average',
                            name: '平均值'
                        }]
                    }
                });
            });

            curChartData = $.extend(true, {}, chartOption, curChartData);

            setTimeout(function() {
                var updateChart = echarts.init(document.getElementById(chartType.id), 'macarons'); 
                updateChart.setOption(curChartData);
                $('#' + chartType.progressId).hide();
            }, 300);
        },

        renderTable: function(type) {
            var ftType = formatMap[type],
                eachDateStr = 'dateList',
                tableTitle = 'Date';

            if (ftType.type == 'realtime') {
                eachDateStr = 'showTimeList';
                tableTitle = 'Time'
            }

            var str = [
                '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">',
                '<thead>',
                    '<tr>',
                        '<th class="mdl-data-table__cell--non-numeric">' + tableTitle + '</th>',
                        '<th>Category</th>',
                        '<th>Update Count</th>',
                    '</tr>',
                '</thead>',
                '<tbody>'
            ].join('');

            $.each(chartData[eachDateStr], function(idx, val) {
                var isFirst = true;
                $.each(chartData[ftType.data], function(key, subVal) {
                    var tempTr = '';
                    if (isFirst) {
                        isFirst = false;
                        tempTr = '<td rowspan=' + ftType.eachArr.length + ' class="mdl-data-table__cell--non-numeric rowspan">' + val + '</td>'
                    }

                    if (ftType.type == 'realtime') {
                        eachDateStr = 'timeList';
                        tableTitle = 'Time'
                    }

                    str += [
                        '<tr>',
                            tempTr,
                            '<td>' + key + '</td>',
                            '<td>' + subVal[idx] + '</td>',
                        '</tr>'
                    ].join('');
                });
            });

            str += '</tbody></table>';
            $('#' + ftType.tableId).html($(str));
        },

        setShowTimeList: function() {
            $.each(chartData.timeList, function(idx, val) {
                if (idx == 0) {
                    chartData.showTimeList.push('00:00~' + val);
                } else {
                    chartData.showTimeList.push(chartData.timeList[idx - 1] + '~' + val);
                }
            });
        },

        setDateList: function() {
            var curDate = LAST_DAY;

            for (var i = 0; i < GAP; i++) {
                chartData.dateList.push(moment(curDate).format('MM/DD'));
                curDate -= 60 * 60 * 24 * 1000;
            }

            chartData.dateList.reverse();
        },

        initEvent: function() {
            var me = this;

            $('#page-content').delegate('.type-filter button', 'click', function(e) {
                var item = $(e.currentTarget);
                if (item.hasClass('mdl-button--colored')) {
                    return;
                }

                item.parent('.type-filter').find('button').removeClass('mdl-button--colored mdl-button--raised');
                item.addClass('mdl-button--colored mdl-button--raised');

                var queryPara = {
                    type: item.data('type'),
                    ftType: item.data('fttype'),
                    noRenderTable: true
                };

                queryPara[item.data('key')] = item.data('value');

                me.getData(queryPara);
            });

            $('#page-content').delegate('.switch-menu ul li', 'click', function(e) {
                var item = $(e.currentTarget);

                var queryPara = {
                    type: item.data('type'),
                    ftType: item.data('fttype'),
                    noRenderChart: true
                };

                item.parents('.switch-menu').find('.cur-choice').text(item.data('value'));

                queryPara[item.data('key')] = item.data('value');

                if (item.data('key') == 'date') {
                    queryPara.web = $('#realtime-web').text();
                }

                if (item.data('key') == 'web') {
                    queryPara.date = $('#realtime-date').text();
                }

                me.getData(queryPara);
            });
        }
    };

    pageRun.init();
})();