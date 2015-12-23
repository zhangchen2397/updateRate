var express = require('express');
var router = express.Router();
var updateInfoDao = require('../dao/updateInfo');

router.get('/', function(req, res, next) {
    updateInfoDao.query(req, res, next);
});

module.exports = router;
