var mysql = require('./app/lib/mysql.js');
var moment = require('moment');

var WEB_ARR = ['腾讯', '新浪', '搜狐', '网易'];
var CATEGORY_ARR = ['要闻', '财经', '娱乐', '体育'];
var DAY_ALALYZE_DATA = [];

function insertUpdateRecord(date) {
    return Promise.all(WEB_ARR.map(function(val, idx) {
        return Promise.all(CATEGORY_ARR.map(function(cateVal, cateIdx) {
            return iterateCategory(val, cateVal);
        }));
    }));

    function iterateCategory(web, category) {
        return new Promise(function(resolve, reject) {
            var query = [
                'select * from report where web=? and category=? and ',
                'unix_timestamp(createTime) > unix_timestamp(?) and unix_timestamp(createTime) < (unix_timestamp(?) + 86400)'
            ].join('');

            mysql.execute(query, [web, category, date, date], function(err, result) {
                if (err) {
                    return reject(err);
                }

                if (result.length < 1) {
                    return resolve(web + '-' + category + ' no data');
                }

                actInsert(result, resolve, reject);
            });
        });
    }

    function actInsert(data, resolve, reject) {
        var updateCount = 0;
        data.forEach(function(val, idx) {
            var rstStr = val.web + '-' + val.category;

            if (data.length - 1 == idx) {
                DAY_ALALYZE_DATA.push({
                    web: val.web,
                    category: val.category,
                    updateCount: updateCount
                });

                if (updateCount == 0) {
                    return resolve(rstStr + ' update count: ' + updateCount);
                }

                return;
            }

            var curCon = val.content,
                nextItem = data[idx + 1],
                nextCon = nextItem.content;

            if (curCon == nextCon) return;

            updateCount++;

            var query = 'delete from update_record where web=? and category=? and updateTime=?'
            mysql.execute(query, [val.web, val.category, nextItem.createTime], function(err, result) {
                if (err) {
                    return reject(err);
                }

                var query = 'insert into update_record(updateTime, web, category, content) values(?, ?, ?, ?)';
                mysql.execute(query, [nextItem.createTime, val.web, val.category, curCon + "##" + nextCon], function(err, result) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(rstStr + ' update count: ' + updateCount);
                });
            });
        });
    }
}

function dayAnalyze(date) {
    DAY_ALALYZE_DATA.forEach(function(val, idx) {
        var web = val.web,
            category = val.category,
            updateCount = val.updateCount;

        var query = 'delete from day_analyze where web=? and category=? and date=?';

        mysql.execute(query, [web, category, date], function(err, result) {
            if (err) return;
            var query = 'insert into day_analyze(date, updateCount, web, category) values(?, ?, ?, ?)';
            mysql.execute(query, [date, updateCount, web, category], function(err, result) {
                if (err) return;
                console.log(web + '-' + category + ' analyze done');
            });
        });
    })
}

//每2小时统计一次
function realTimeAnalyze(date) {
    for (var i = 0; i < 12; i++) {
        var curTime = date + ' ' + formatTime(i * 2 * 60);
        var nextTime = moment((+new Date(curTime)) + 2 * 60 * 60 * 1000).format('YYYY-MM-DD HH:mm:ss');

        console.log(curTime);
        console.log(nextTime);
        console.log('========================');

        var query = [
            'select count(1) as updateCount, web, category from update_record where ',
            'unix_timestamp(updateTime) > unix_timestamp(?) and unix_timestamp(updateTime) < unix_timestamp(?) ',
            'group by category, web'
        ].join('');

        (function(curTime, nextTime) {
            mysql.execute(query, [curTime, nextTime], function(err, result) {
                if (err) return;
                result.forEach(function(val, idx) {
                    insertToRealTimeData(val, nextTime);
                });
            });
        })(curTime, nextTime);
    }

    function insertToRealTimeData(val, timeStamp) {
        var date = moment(timeStamp).format('YYYY-MM-DD HH:mm:ss');
        var query = 'delete from realtime_analyze where web=? and category=? and date=?';
        mysql.execute(query, [val.web, val.category, date], function(err, result) {
            if (err) return;
            var query = 'insert into realtime_analyze(date, updateCount, web, category) values(?, ?, ?, ?)';
            mysql.execute(query, [date, val.updateCount, val.web, val.category], function(err, result) {
                if (err) return;
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
}

function run(date) {
    process.stdout.write('starting analyze');
    var startAnalyzeTime = +new Date();
    var waitTimer = setInterval(function() {
        process.stdout.write('.');
    }, 100);

    if (!date) {
        date = moment(new Date()).format('YYYY-MM-DD');
    }

    insertUpdateRecord(date).then(function(result) {
        clearInterval(waitTimer);
        var totalAnalyzeTime = parseInt((+new Date() - startAnalyzeTime) / 1000, 10);
        console.log(totalAnalyzeTime + 's, analyze ok');

        dayAnalyze(date);
        realTimeAnalyze(date);
    }, function(error) {
        console.log(error);
    }).catch(function(err) {
        console.error(err);
    });
}

run();
