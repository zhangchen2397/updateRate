//防止在终端乱码
phantom.outputEncoding = "GBK";

var JQ_URL = '//code.jquery.com/jquery-1.11.3.min.js';
var WEB_URL_MAP = {
    qq: 'http://info.3g.qq.com/g/s?aid=index&g_ut=3',
    sina: 'http://sina.cn',
    sohu: 'http://m.sohu.com/?v=3&amp;_once_=sohu_version_3&amp;_smuid=FvsOWg2jhdCXP9sr2GgLja'
};

function getQQListData() {
    console.log('open qq web');
    page = require( 'webpage' ).create();

    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    page.open(WEB_URL_MAP['qq'], function(status) {
        page.includeJs(JQ_URL, function() {
            var rst = page.evaluate(function() {
                function getWebData() {
                    var rst = {
                        webName: 'qq',
                        list: []
                    };

                    var cateArr = [{
                        id: 'lincoapp-home-jryw',
                        name: '要闻'
                    }, {
                        id: 'lincoapp-home-sports',
                        name: '体育'
                    }, {
                        id: 'lincoapp-home-ent',
                        name: '娱乐'
                    }];

                    $.each(cateArr, function(index, value) {
                        var curItemData = {
                            cateName: value.name,
                            content: []
                        };

                        var listEl = $('#' + value.id + ' .lincoapp-home-list>li');

                        $.each(listEl, function(subIdx, subVal) {
                            var fullText = $.trim($(subVal).text());
                            if (!/广告/g.test(fullText)) {
                                curItemData.content.push($.trim($($(subVal).find('p')).text()));
                            }
                        });

                        rst.list.push(curItemData);
                    });

                    return rst;
                }

                return getWebData();
            });

            RESULT.push(rst);

            console.log('spider qq web success');

            page.close();
        });
    });

    page.onClosing = function() {
        console.log('close qq page');
        console.log('=======================');
        getSohuListData();
    }
}

function getSohuListData() {
    console.log('open sohu web');
    page = require( 'webpage' ).create();

    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    page.open(WEB_URL_MAP['sohu'], function(status) {
        page.includeJs(JQ_URL, function() {
            var rst = page.evaluate(function() {
                function getWebData() {
                    var rst = {
                        webName: 'sohu',
                        list: []
                    };

                    var cateArr = [{
                        className: 'adISNews',
                        name: '要闻'
                    }, {
                        className: 'adISEconomics',
                        name: '财经'
                    }, {
                        className: 'adISEntertainments',
                        name: '娱乐'
                    }];

                    $.each(cateArr, function(index, value) {
                        var curItemData = {
                            cateName: value.name,
                            content: []
                        };

                        var listEl = $('.' + value.className).parent('.cnl').find('.it');

                        $.each(listEl, function(subIdx, subVal) {
                            var curItem = $(subVal);
                            if (!curItem.attr('id')) {
                                curItemData.content.push($.trim(curItem.text()));
                            }
                        });

                        rst.list.push(curItemData);
                    });

                    return rst;
                }

                return getWebData();
            });

            RESULT.push(rst);

            console.log('spider sohu web success');

            page.close();
        });
    });

    page.onClosing = function() {
        console.log('close sohu page');
        console.log('=======================');
        getSinaListData();
    }
}

function getSinaListData() {
    console.log('open sina web');
    page = require( 'webpage' ).create();

    page.onConsoleMessage = function(msg) {
        //console.log(msg);
    };

    page.onError = function(msg, trace) {
        //console.error(msg);
    }

    page.open(WEB_URL_MAP['sina'], function(status) {
        page.includeJs(JQ_URL, function() {
            var rst = page.evaluate(function() {
                function getWebData() {
                    var rst = {
                        webName: 'sina',
                        list: []
                    };

                    //要闻单独处理
                    (function() {
                        var ywEl = $('#j_card_yaowen dl.f_card');
                        var curItemData = {
                            cateName: '要闻',
                            content: []
                        };
                        $.each(ywEl, function(idx, val) {
                            var fullText = $.trim($(val).text());
                            if (!/赞助/g.test(fullText)) {
                                curItemData.content.push($.trim($($(val).find('h3')).text()));
                            }
                        });

                        rst.list.push(curItemData);
                    })();

                    var cateArr = [{
                        id: 'sports',
                        name: '体育'
                    }, {
                        id: 'ent',
                        name: '娱乐'
                    }, {
                        id: 'finance',
                        name: '财经'
                    }];

                    $.each(cateArr, function(index, value) {
                        var curItemData = {
                            cateName: value.name,
                            content: []
                        };

                        var listEl = $('[data-channel="' + value.id + '"]');

                        $.each(listEl, function(subIdx, subVal) {
                            var subItem = $(subVal);

                            //图片数据
                            $.each($(subItem.find('ul.f_pic_small>li')), function() {
                                curItemData.content.push($.trim($(this).text()));
                            });

                            //列表数据
                            $.each($(subItem.find('dl.f_card')), function() {
                                var fullText = $.trim($(this).text());
                                if (!/赞助/g.test(fullText)) {
                                    curItemData.content.push($.trim($($(this).find('h3')).text()));
                                }
                            });
                        });

                        rst.list.push(curItemData);
                    });

                    return rst;
                }

                return getWebData();
            });

            RESULT.push(rst);

            console.log('spider sina web success');

            page.close();
        });
    });

    page.onClosing = function() {
        console.log('close sina page');
        console.log('=======================');
    }
}

//调用
var COUNT = 1;
var RESULT = [];
setInterval(function() {
    console.log(new Date());
    console.log(COUNT++);
    RESULT = [];
    getQQListData();

    var server = require('webserver').create();
    server.listen(8080, function(request, response) {
        response.statusCode = 200;
        response.write('<html><body>' + JSON.stringify(RESULT) + '</body></html>');
        response.close();
    });
}, 20 * 1000);
