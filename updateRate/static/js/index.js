(function() {
    var GAP = 12;
    var DATE_GAP = 60 * 60 * 24 * (GAP - 1) * 1000;
    var API = '/updateInfo';
    var WEB_ARR = ['腾讯', '新浪', '搜狐', '网易'];
    var CATEGORY_ARR = ['要闻', '财经', '娱乐', '体育'];
    var EMPTY_DATA = [];

    for (var i = 0; i < GAP; i++) {
        EMPTY_DATA.push[0];
    }

    var charOption = {
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
        webList: {}
    };

    var formatMap = {
        byweb: {
            data: 'cateList',
            key: 'category',
            eachArr: CATEGORY_ARR,
            chartTitle: '按网站各频道更新次数',
            id: 'chart-byweb',
            tableId: 'table-byweb'
        },
        bycate: {
            data: 'webList',
            key: 'web',
            eachArr: WEB_ARR,
            chartTitle: '按频道各网站更新次数',
            id: 'chart-bycate',
            tableId: 'table-bycate'
        }
    };

    function renderTable(type) {
        var ftType = formatMap[type];
        var str = [
            '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">',
            '<thead>',
                '<tr>',
                    '<th class="mdl-data-table__cell--non-numeric">Date</th>',
                    '<th>Category</th>',
                    '<th>Update Count</th>',
                '</tr>',
            '</thead>',
            '<tbody>'
        ].join('');

        $.each(chartData.dateList, function(idx, val) {
            var isFirst = true;
            $.each(chartData[ftType.data], function(key, subVal) {
                var tempTr = '';
                if (isFirst) {
                    isFirst = false;
                    tempTr = '<td rowspan=' + ftType.eachArr.length + ' class="mdl-data-table__cell--non-numeric rowspan">' + val + '</td>'
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
    }

    var pageRun = {
        init: function() {
            this.getDateList();
            this.getData({
                web: '腾讯',
                ftType: 'byweb'
            });

            this.getData({
                category: '要闻',
                ftType: 'bycate'
            });
        },

        getData: function(options) {
            var me = this,
                options = options || {},
                type = options.type || 'day',
                date = options.date || moment((+new Date() - DATE_GAP)).format('YYYY-MM-DD'),
                endDate = options.endDate || moment().format('YYYY-MM-DD'),
                web = options.web,
                category = options.category,
                ftType = options.ftType;

            var queryPara = {
                type: type,
                date: date,
                endDate: endDate
            };

            endDate && (queryPara.endDate = endDate);
            web && (queryPara.web = web);
            category && (queryPara.category = category);

            $.ajax({
                url: API,
                data: queryPara
            }).done(function(data) {
                if (data.code == 0) {
                    if (ftType) {
                        me.formatData(data.list, ftType);
                        me.renderChart(ftType);
                        renderTable(ftType);
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
                eachArr = ftType.eachArr;

            $.each(chartData.dateList, function(idx, val) {
                $.each(data, function(subIdx, subVal) {
                    var date = moment(subVal.date).format('MM/DD');
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
                    $.each(chartData.dateList, function(dateIdx, dateVal) {
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

            var curChartData = {
                title: {
                    text: chartType.chartTitle
                },
                legend: {
                    data: []
                },
                xAxis: [{
                    data: chartData.dateList
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

            curChartData = $.extend(true, {}, charOption, curChartData);

            var myChart = echarts.init(document.getElementById(chartType.id), 'macarons'); 
            myChart.setOption(curChartData);
        },

        getDateList: function() {
            var curDate = +new Date();

            for (var i = 0; i < GAP; i++) {
                chartData.dateList.push(moment(curDate).format('MM/DD'));
                curDate -= 60 * 60 * 24 * 1000;
            }

            chartData.dateList.reverse();
        }
    };

    pageRun.init();
})();