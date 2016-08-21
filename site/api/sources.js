var express = require('express');
var Source = require('../models/source.js');

var sources = express();

sources.get('/', function (req, res) {

  res.json({});
});

sources.get('/all', function (req, res) {
  var result = Source.findAll(function (err, sources, fields) {
    res.json(sources)
  })
})

sources.get('/findAllWithSummary', function (req, res) {
  var result = Source.findAllWithSummary(function (err, response, fields) {
    res.json({err: err, response: response, fields: fields})
  })
})

module.exports = sources;
