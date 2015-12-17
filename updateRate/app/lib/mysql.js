var mysql = require('mysql');
var conf = require('../conf/db');

var pool  = mysql.createPool(conf.mysql);
  
var execute = function(sql, args, callback){  
    pool.getConnection(function(err,conn){  
        if(err){  
            console.error('[sql connect error] '+ err.stack);
        } else { 
            conn.query(sql, args, function(err,res){  
                //释放连接  
                conn.release();
                
                if (err) {
                    console.error('[sql query error] '+ err.stack);
                }

                callback(err, res);
            });  
        }  
    });  
};  
  
module.exports = {
    execute: execute
};  