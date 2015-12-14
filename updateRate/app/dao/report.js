var mysql = require('mysql');
var _ = require('underscore');
var conf = require('../conf/db');
var sql = require('./reportSqlMap');
var moment = require('moment');

var WEB_ARR = ['手机腾讯网', '手机新浪网', '手机搜狐网'];
var CATEGORY_ARR = ['要闻', '财经', '娱乐', '体育']
 
var pool  = mysql.createPool(_.extend({}, conf.mysql));
 
// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({
            code:'1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

// date '2015-12-15'
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

function calUpdate(data, web, category, date, parentCnct) {
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
                        var query = 'INSERT INTO update_record(updateTime, web, category, content) VALUES(?, ?, ?, ?)';
                        connection.query(query, [nextItem.createTime, web, category, curCon + "##" + nextCon], function(err, result) {
                            connection.release();
                        });
                    }
                });
            });
        }
    });

    if (!updateCount) return;
    pool.getConnection(function(err, connection) {
        var query = 'select * from day_analyze where web=? and category=? and date=?';
        connection.query(query, [web, category, date], function(err, result) {
            if (!result.length) {
                var query = 'INSERT INTO day_analyze(date, updateCount, web, category) VALUES(?, ?, ?, ?)';
                connection.query(query, [date, updateCount, web, category], function(err, result) {
                    connection.release();
                });
            }
        });
    });
}

dayAnalyze();

module.exports = {
    add: function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        pool.getConnection(function(err, connection) {
            // 获取前台页面传过来的参数
            var param = req.query || req.params;
            var queryParam = [param.content, param.web, param.category];
 
            // 建立连接，向表中插入值
            connection.query(sql.insert, queryParam, function(err, result) {
                if(result) {
                    result = {
                        code: 200,
                        msg: '增加成功'
                    };
                }
 
                // 以json形式，把操作结果返回给前台页面
                jsonWrite(res, result);
 
                // 释放连接
                connection.release();
            });
        });
    }
};