var mysql = require('../lib/mysql');
 
module.exports = {
    add: function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        var param = req.query || req.params;
        var queryParam = [param.content, param.web, param.category]; 
        var query = 'INSERT INTO report(content, web, category) VALUES(?,?,?)';
        
        mysql.execute(query, queryParam, function(result) {
            if(result) {
                result = {
                    code: 200,
                    msg: '增加成功'
                };
            }

            if(typeof result === 'undefined') {
                res.json({
                    code:'1',
                    msg: '操作失败'
                });
            } else {
                res.json(result);
            }
        });
    }
};