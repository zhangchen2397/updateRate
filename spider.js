//防止在终端乱码
phantom.outputEncoding = "GBK";

var JQ_URL = '//code.jquery.com/jquery-1.11.3.min.js';
var WEB_URL_MAP = {
    'qq': 'http://info.3g.qq.com/g/s?aid=index&g_ut=3',
    'sina': 'http://sina.cn',
    'sohu': 'http://m.sohu.com/?v=3&amp;_once_=sohu_version_3&amp;_smuid=FvsOWg2jhdCXP9sr2GgLja',
    '163': 'http://3g.163.com/touch'
};
var REPORT_URL = 'http://localhost:3000/report/add';

function getQQListData() {
    console.log('open qq web');
    page = require( 'webpage' ).create();

    page.onConsoleMessage = function(msg) {
        //console.log(msg);
    };

    page.onError = function(msg, trace) {
        //console.error(msg);
    }

    page.open(WEB_URL_MAP['qq'], function(status) {
        page.includeJs(JQ_URL, function() {
            var rst = page.evaluate(function(reportUrl) {
                function getWebData() {
                    var rst = {
                        webName: '手机腾讯网',
                        list: []
                    };

                    var cateArr = [{
                        id: 'lincoapp-home-jryw',
                        name: '要闻'
                    }, {
                        id: 'lincoapp-home-finance',
                        name: '财经'
                    }, {
                        id: 'lincoapp-home-ent',
                        name: '娱乐'
                    }, {
                        id: 'lincoapp-home-sports',
                        name: '体育'
                    }];

                    $.each(cateArr, function(index, value) {
                        var curItemData = {
                            cateName: value.name,
                            content: []
                        };

                        var listEl = $('#' + value.id + ' .lincoapp-home-list>li');

                        $.each(listEl, function(subIdx, subVal) {
                            if (curItemData.content.length < 8) {
                                var fullText = $.trim($(subVal).text());
                                if (!/广告/g.test(fullText)) {
                                    curItemData.content.push($.trim($($(subVal).find('p')).text()));
                                }
                            }
                        });

                        rst.list.push(curItemData);
                    });

                    return rst;
                }

                //上报抓取数据
                var rst = getWebData();
                $.each(rst.list, function(index, value) {
                    $.ajax({
                        url: reportUrl,
                        data: {
                            content: value.content.join('@'),
                            web: rst.webName,
                            category: value.cateName
                        }
                    }).done(function(data) {
                        console.log(JSON.stringify(data));
                    }).fail(function(data) {
                        console.log(JSON.stringify(data));
                    });
                });

                return rst;
            }, REPORT_URL);

            RESULT.push(rst);

            console.log('spider qq web success');

            var server = require('webserver').create();
            server.listen(8080, function(request, response) {
                response.statusCode = 200;
                response.write('<html><body>' + JSON.stringify(RESULT) + '</body></html>');
                response.close();
            });

            setTimeout(function() {
                page.close();
            }, 500);
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
        //console.log(msg);
    };

    page.onError = function(msg, trace) {
        //console.error(msg);
    }

    page.open(WEB_URL_MAP['sohu'], function(status) {
        page.includeJs(JQ_URL, function() {
            var rst = page.evaluate(function(reportUrl) {
                function getWebData() {
                    var rst = {
                        webName: '手机搜狐网',
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
                    }, {
                        className: 'adISSports',
                        name: '体育'
                    }];

                    var contentLen = 8;

                    $.each(cateArr, function(index, value) {
                        var curItemData = {
                            cateName: value.name,
                            content: []
                        };

                        var listEl = $('.' + value.className).parent('.cnl').find('.ls>.it');

                        //sohu体育的列表数据会随机变化，只取前3条
                        if (value.name == '体育') {
                            contentLen = 3;
                        } else {
                            contentLen = 8
                        }

                        $.each(listEl, function(subIdx, subVal) {
                            if (curItemData.content.length < contentLen) {
                                var curItem = $(subVal);
                                if (!curItem.attr('id')) {
                                    curItemData.content.push($.trim(curItem.text()));
                                }
                            }
                        });

                        rst.list.push(curItemData);
                    });

                    return rst;
                }

                //上报抓取数据
                var rst = getWebData();
                $.each(rst.list, function(index, value) {
                    $.ajax({
                        url: reportUrl,
                        data: {
                            content: value.content.join('@'),
                            web: rst.webName,
                            category: value.cateName
                        }
                    }).done(function(data) {
                        console.log(JSON.stringify(data));
                    }).fail(function(data) {
                        console.log(JSON.stringify(data));
                    });
                });

                return rst;
            }, REPORT_URL);

            RESULT.push(rst);

            console.log('spider sohu web success');

            var server = require('webserver').create();
            server.listen(8080, function(request, response) {
                response.statusCode = 200;
                response.write('<html><body>' + JSON.stringify(RESULT) + '</body></html>');
                response.close();
            });

            setTimeout(function() {
                page.close();
            }, 1000);
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
            var rst = page.evaluate(function(reportUrl) {
                function getWebData() {
                    var rst = {
                        webName: '手机新浪网',
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
                        id: 'finance',
                        name: '财经'
                    }, {
                        id: 'ent',
                        name: '娱乐'
                    }, {
                        id: 'sports',
                        name: '体育'
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
                                if (curItemData.content.length < 8) {
                                    var fullText = $.trim($(this).text());
                                    if (!/赞助/g.test(fullText)) {
                                        curItemData.content.push($.trim($($(this).find('h3')).text()));
                                    }
                                }
                            });
                        });

                        rst.list.push(curItemData);
                    });

                    return rst;
                }

                //上报抓取数据
                var rst = getWebData();
                $.each(rst.list, function(index, value) {
                    $.ajax({
                        url: reportUrl,
                        data: {
                            content: value.content.join('@'),
                            web: rst.webName,
                            category: value.cateName
                        }
                    }).done(function(data) {
                        console.log(JSON.stringify(data));
                    }).fail(function(data) {
                        console.log(JSON.stringify(data));
                    });
                });

                return rst;
            }, REPORT_URL);

            RESULT.push(rst);

            console.log('spider sina web success');

            var server = require('webserver').create();
            server.listen(8080, function(request, response) {
                response.statusCode = 200;
                response.write('<html><body>' + JSON.stringify(RESULT) + '</body></html>');
                response.close();
            });

            setTimeout(function() {
                page.close();
            }, 500);
        });
    });

    page.onClosing = function() {
        console.log('close sina page');
        console.log('=======================');
        get163ListData();
    }
}

function get163ListData() {
    console.log('open 163 web');
    page = require( 'webpage' ).create();

    page.onConsoleMessage = function(msg) {
        //console.log(msg);
    };

    page.onError = function(msg, trace) {
        //console.error(msg);
    }

    page.open(WEB_URL_MAP['163'], function(status) {
        page.includeJs(JQ_URL, function() {
            var rst = page.evaluate(function(reportUrl) {
                function getWebData() {
                    var rst = {
                        webName: '手机网易网',
                        list: []
                    };

                    var cateArr = [{
                        selector: '.m-emphasis ul li a',
                        name: '要闻'
                    }, {
                        selector: '.stockWrapper',
                        name: '财经'
                    }, {
                        selector: '.amusement .newsList ul li ul li a',
                        name: '娱乐'
                    }, {
                        selector: '.sport-tab div.u-list>ul>li ul li a',
                        name: '体育'
                    }];

                    $.each(cateArr, function(index, value) {
                        var curItemData = {
                            cateName: value.name,
                            content: []
                        };

                        var listEl = $(value.selector);
                        if (value.name == '财经') {
                            listEl = $(value.selector).siblings('.newsPage').find('li a');
                        }

                        $.each(listEl, function(subIdx, subVal) {
                            if (curItemData.content.length < 8) {
                                if (value.name == '体育') {
                                    if (subIdx > 7) {
                                        var text = $.trim($(subVal).html().split('<span>')[0]);
                                        curItemData.content.push(text);
                                    }
                                } else {
                                    var text = $.trim($(subVal).html().split('<span>')[0]);
                                    curItemData.content.push(text);
                                }
                            }
                        });

                        rst.list.push(curItemData);
                    });

                    return rst;
                }

                //上报抓取数据
                var rst = getWebData();
                $.each(rst.list, function(index, value) {
                    $.ajax({
                        url: reportUrl,
                        data: {
                            content: value.content.join('@'),
                            web: rst.webName,
                            category: value.cateName
                        }
                    }).done(function(data) {
                        console.log(JSON.stringify(data));
                    }).fail(function(data) {
                        console.log(JSON.stringify(data));
                    });
                });

                return rst;
            }, REPORT_URL);

            RESULT.push(rst);

            console.log('spider 163 web success');

            var server = require('webserver').create();
            server.listen(8080, function(request, response) {
                response.statusCode = 200;
                response.write('<html><body>' + JSON.stringify(RESULT) + '</body></html>');
                response.close();
            });

            setTimeout(function() {
                page.close();
            }, 500);
        });
    });

    page.onClosing = function() {
        console.log('close 163 page');
        console.log('=======================');
    }
}

//调用
var COUNT = 1;
var RESULT = [];

function initRun() {
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
}

function intervalRun() {
    setInterval(function() {
        initRun();
    }, 2 * 60 * 1000);
}

function run() {
    initRun();
    intervalRun();
}

run();
