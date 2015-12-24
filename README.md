# updateRate

comming soon...

http 查询接口
http://localhost:3000/updateInfo?type=day&web=qq&category=news&date=2015-12-17
http://localhost:3000/updateInfo?type=realTime&web=qq&category=news&date=2015-12-17

数据结构
day_analyze
按网站

{
    "12/13": {
        "要闻": 23,
        "体育": 63,
        "娱乐": 90,
        "财经": 89
    },
    "12/14": {
        "要闻": 23,
        "体育": 63,
        "娱乐": 90,
        "财经": 89
    },
    "12/15": {
        "要闻": 23,
        "体育": 63,
        "娱乐": 90,
        "财经": 89
    }
}

{
    dateList: ["12/13", "12/14", "12/15", "12/16"],
    list: {
        "要闻": [23, 23, 89, 0],
        "体育": [34, 23, 0, 90],
        "娱乐": [90, 23, 34, 23]
    }
}