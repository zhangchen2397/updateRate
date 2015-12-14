var mysql = require('mysql');
var _ = require('underscore');
var conf = require('./app/conf/db');
var moment = require('moment');

var WEB_ARR = ['手机腾讯网', '手机新浪网', '手机搜狐网'];
var CATEGORY_ARR = ['要闻', '财经', '娱乐', '体育']
 
var pool  = mysql.createPool(_.extend({}, conf.mysql));

//date '2015-12-15'
function dayAnalyze(date) {
    var compareDate = (+new Date(moment(new Date()).format('YYYY-MM-DD'))) / 1000;
    if (date) {
        compareDate = (+ new Date(date)) / 1000;
    }

    _.each(WEB_ARR, function(val, idx) {
        _.each(CATEGORY_ARR, function(cateVal, cateIdx) {
            var query = [
                'select * from report where web=? and category=? and ',
                'unix_timestamp(createTime) > ? and unix_timestamp(createTime) < (? + 86400)'
            ].join('');

            pool.getConnection(function(err, connection) {
                connection.query(query, [val, cateVal, compareDate, compareDate], function(err, result) {
                    if (err) console.log(err);
                    if (!result.length) return;
                    connection.release();
                    calUpdate(result, val, cateVal, moment(result[0].createTime).format('YYYY-MM-DD'));
                });
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
            pool.getConnection(function(err, connection) {
                var query = 'select * from update_record where web=? and category=? and updateTime=?'
                connection.query(query, [web, category, nextItem.createTime], function(err, result) {
                    if (!result.length) {
                        var query = 'insert into update_record(updateTime, web, category, content) values(?, ?, ?, ?)';
                        connection.query(query, [nextItem.createTime, web, category, curCon + "##" + nextCon], function(err, result) {
                            connection.release();
                        });
                    }
                });
            });
        }
    });

    console.log(web + '-' + category + ' update count: ' + updateCount);

    if (!updateCount) return;
    pool.getConnection(function(err, connection) {
        var query = 'select * from day_analyze where web=? and category=? and date=?';
        connection.query(query, [web, category, date], function(err, result) {
            if (!result.length) {
                var query = 'insert into day_analyze(date, updateCount, web, category) values(?, ?, ?, ?)';
                connection.query(query, [date, updateCount, web, category], function(err, result) {
                    console.log('analyze done');
                    connection.release();
                });
            }
        });
    });
}

dayAnalyze();
//dayAnalyze('2015-12-14');
//dayAnalyze('2015-12-13');