var express = require('express');
var router = express.Router();
var reportDao = require('../dao/report');

router.get('/', function(req, res, next) {
  res.send('respond with a report.js');
});

router.get('/add', function(req, res, next) {
    reportDao.add(req, res, next);
});

router.get('/analyze', function(req, res, next) {
    reportDao.analyze(req, res, next);
});

module.exports = router;