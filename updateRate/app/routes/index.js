var express = require('express');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var lastDayStamp = +new Date() - 24 * 60 * 60 * 1000;
    var lastDay = moment(lastDayStamp).format('YYYY-MM-DD');
    var realtimeDateList = [];
    var WEB_ARR = ['腾讯', '新浪', '搜狐', '网易'];
    var CATEGORY_ARR = ['要闻', '财经', '娱乐', '体育'];

    function setDateList() {
        var curDate = lastDayStamp;

        for (var i = 0; i < 3; i++) {
            realtimeDateList.push(moment(curDate).format('YYYY-MM-DD'));
            curDate -= 60 * 60 * 24 * 1000;
        }
    }

    setDateList();

    res.render('index', {
        title: '手机门户实时更新对比',
        lastDay: lastDay,
        realtimeDateList: realtimeDateList,
        webArr: WEB_ARR,
        cateArr: CATEGORY_ARR,
        webNav: [{
            title: '手机腾讯网',
            url: 'http://info.3g.qq.com/g/s?aid=index&g_ut=3&g_ver=0'
        }, {
            title: '手机新浪网',
            url: 'http://sina.cn'
        }, {
            title: '手机搜狐网',
            url: 'http://m.sohu.com/?v=3&amp;_once_=sohu_version_3&amp;_smuid=FvsOWg2jhdCXP9sr2GgLja'
        }, {
            title: '手机网易网',
            url: 'http://3g.163.com/touch'
        }]
    });
});

module.exports = router;
