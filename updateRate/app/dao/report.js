var mysql = require('../lib/mysql');
 
module.exports = {
    add: function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        var param = req.query || req.params;
        var queryParam = [param.content, param.web, param.category]; 
        var query = 'INSERT INTO report(content, web, category) VALUES(?,?,?)';
        
        mysql.execute(query, queryParam, function(err, result) {
            var rtData = {
                code: 0,
                msg: '增加成功'
            };

            if (err) {
                rtData = {
                    code: 1,
                    msg: '增加失败'
                };
            }
            
            res.json(rtData);
        });
    }
};