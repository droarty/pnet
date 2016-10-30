var express = require('express');
var Tests = require('../models/tests.js');

var tests = express();

tests.get('/', function (req, res) {

  res.json({});
});

tests.get('/all', function (req, res) {
  var result = Tests.findAll(function (err, response, fields) {
    res.json({err: err, response: response, fields: fields})
  })
})

tests.get('/findBySourceId', function (req, res) {
  var result = Tests.findBySourceId(function (err, response, fields) {
    res.json({err: err, response: response, fields: fields})
  })
})

module.exports = tests;
