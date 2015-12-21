var mysql = require('../lib/mysql');
var moment = require('moment');
 
module.exports = {
    query: function (req, res, next) {
        var param = req.query || req.params;

        var type = param.type,
            web = param.web,
            category = param.category,
            date = param.date || moment(new Date()).format('YYYY-MM-DD');

        var rtFailData = {
            code: 2,
            msg: '查询数据失败'
        };

        var rtSucData = {
            code: 0,
            msg: 'success',
            list: []
        };

        if (!type) {
            res.json({
                code: 1,
                msg: 'type参数不能为空'
            });
        } else {
            if (type == 'day') {
                updateByDay();
            } else {
                updateByRealTime();
            }
        }

        function updateByDay() {
            var query = getQuery('day_analyze');
            mysql.execute(query.queryStr, query.queryArr, function(err, result) {
                actResult(err, result);
            });
        }

        function updateByRealTime() {
            var query = getQuery('realtime_analyze');
            mysql.execute(query.queryStr, query.queryArr, function(err, result) {
                actResult(err, result);
            });
        }

        function getQuery(table) {
            var queryStr = 'select * from ' + table + ' where 1=1';
            var queryArr = [];

            if (table == 'day_analyze') {
                queryStr += ' and date=?';
                queryArr.push(date);
            } else {
                var nextDate = moment(+new Date(date) + 86400 * 1000).format('YYYY-MM-DD');
                queryStr += ' and unix_timestamp(date) > unix_timestamp(?) and unix_timestamp(date) <= unix_timestamp(?)';
                queryArr.push(date, nextDate);
            }
            
            if (web) {
                queryStr += ' and web=?';
                queryArr.push(web);
            }

            if (category) {
                queryStr += ' and category=?';
                queryArr.push(category);
            }

            return {
                queryStr: queryStr,
                queryArr: queryArr
            }
        }

        function actResult(err, result) {
            if (err) {
                res.json(rtFailData);
            } else {
                result.forEach(function(val, idx) {
                    val.date = moment(val.date).format('YYYY-MM-DD HH:mm:ss');
                });

                rtSucData.list = result;
                res.json(rtSucData);
            }
        }
    }
};