var mysql = require('mysql');
var _ = require('underscore');
var conf = require('../conf/db');
var moment = require('moment');
 
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

function actionDayAnalyze(data) {
    var updateCount = 0;
    _.each(data, function(val, idx) {
        if (data.length - 1 == idx) return;
        var curCon = val.content,
            nextItem = data[idx + 1],
            nextCon = nextItem.content;

        if (curCon != nextCon) {
            updateCount++;
            // pool.getConnection(function(err, connection) {
            //     var query = 'INSERT INTO update_record(updateTime, web, category) VALUES(?, ?, ?)';
            //     connection.query(query, [nextItem.createTime, '手机腾讯网', '要闻'], function(err, result) {
            //         connection.release();
            //     });
            // });
        }
    });

    if (!updateCount) return;

    pool.getConnection(function(err, connection) {
        var query = 'select * from day_analyze where web=? and category=? and date=?'
        connection.query(query, ['手机腾讯网', '要闻', '2015-12-14'], function(err, result) {
            if (!result.length) {
                var query = 'INSERT INTO day_analyze(date, updateCount, web, category) VALUES("2015-12-14", ?, ?, ?)';
                connection.query(query, [updateCount, '手机腾讯网', '要闻'], function(err, result) {
                    connection.release();
                });
            }
        });
    });
}
 
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
    },

    analyze: function (req, res, next) {
        var query = 'select * from report where web="手机腾讯网" and category="要闻" order by createTime desc';
        pool.getConnection(function(err, connection) {
            connection.query(query, function(err, result) {
                if (err) console.log(err);

                _.each(result, function(val) {
                    val.createTime = moment(val.createTime).format('YYYY-MM-DD HH:mm:ss');
                    val.timestamp = +new Date(val.createTime);
                });

                actionDayAnalyze(result);

                res.render('analyze', {
                    result: result
                });
                connection.release();
            });
        });
    }
};