var mysql = require('./app/lib/mysql.js');
var _ = require('underscore');
var moment = require('moment');

var WEB_ARR = ['手机腾讯网', '手机新浪网', '手机搜狐网'];
var CATEGORY_ARR = ['要闻', '财经', '娱乐', '体育'];

//每半小时统计一次
function realTimeAnalyze(date) {
    if (!date) {
        date = moment(new Date()).format('YYYY-MM-DD');
    }

    for (var i = 0; i < 48; i++) {
        var curTime = date + ' ' + formatTime(i * 30);
        var nextTime = moment((+new Date(curTime)) + 30 * 60 * 1000).format('YYYY-MM-DD HH:mm:ss');

        console.log(curTime);
        console.log(nextTime);
        console.log('========================');

        var query = [
            'select count(*) as updateCount, web, category from update_record where ',
            'unix_timestamp(updateTime) > unix_timestamp(?) and unix_timestamp(updateTime) < unix_timestamp(?) ',
            'group by category, web'
        ].join('');

        (function(curTime, nextTime) {
            mysql.execute(query, [curTime, nextTime], function(result) {
                _.each(result, function(val, idx) {
                    insertToRealTimeData(val, nextTime);
                });
            });
        })(curTime, nextTime);
    }
}

function insertToRealTimeData(val, timeStamp) {
    var date = moment(timeStamp).format('YYYY-MM-DD HH:mm:ss');
    var query = 'delete from realtime_analyze where web=? and category=? and date=?';
    mysql.execute(query, [val.web, val.category, date], function(result) {
        var query = 'insert into realtime_analyze(date, updateCount, web, category) values(?, ?, ?, ?)';
        mysql.execute(query, [date, val.updateCount, val.web, val.category], function(result) {
            console.log(val.web + '-' + val.category + ' insert realtime data done');
        });
    });
}

function formatTime(minutes) {
    var hour = parseInt(minutes / 60, 10);
    var minute = minutes % 60 || '00';

    if (hour < 10) {
        hour = '0' + hour;
    }

    return hour + ':' + minute + ':' + '00';
}

realTimeAnalyze('2015-12-15');

// dayAnalyze();
// dayAnalyze('2015-12-15');
// dayAnalyze('2015-12-14');
// dayAnalyze('2015-12-13');

 
//date '2015-12-15'
function dayAnalyze(date) {
    if (!date) {
        date = moment(new Date()).format('YYYY-MM-DD');
    }

    _.each(WEB_ARR, function(val, idx) {
        _.each(CATEGORY_ARR, function(cateVal, cateIdx) {
            var query = [
                'select * from report where web=? and category=? and ',
                'unix_timestamp(createTime) > unix_timestamp(?) and unix_timestamp(createTime) < (unix_timestamp(?) + 86400)'
            ].join('');

            mysql.execute(query, [val, cateVal, date, date], function(result) {
                if (!result.length) return;
                calUpdate(result, val, cateVal, date);
            });
        });
    });
}

function calUpdate(data, web, category, date) {
    var updateCount = 0;
    _.each(data, function(val, idx) {
        if (data.length - 1 == idx) return;
        var curCon = val.content,
            nextItem = data[idx + 1],
            nextCon = nextItem.content;

        if (curCon != nextCon) {
            updateCount++;

            var query = 'select * from update_record where web=? and category=? and updateTime=?'
            mysql.execute(query, [web, category, nextItem.createTime], function(result) {
                if (!result.length) {
                    var query = 'insert into update_record(updateTime, web, category, content) values(?, ?, ?, ?)';
                    mysql.execute(query, [nextItem.createTime, web, category, curCon + "##" + nextCon], function(result) {
                        //console.log(result);
                    });
                }
            });
        }
    });

    console.log(web + '-' + category + ' update count: ' + updateCount);

    if (!updateCount) return;

    var query = 'delete from day_analyze where web=? and category=? and date=?';
    mysql.execute(query, [web, category, date], function(result) {
        var query = 'insert into day_analyze(date, updateCount, web, category) values(?, ?, ?, ?)';
        mysql.execute(query, [date, updateCount, web, category], function(result) {
            console.log(web + '-' + category + ' analyze done');
        });
    });
}