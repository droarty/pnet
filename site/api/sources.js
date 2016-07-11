var express = require('express');
var Source = require('../models/source.js');

var sources = express();

sources.get('/', function (req, res) {

  res.json({});
});



sources.get('/all', function (req, res) {
  var result = Source.findAll(null, function (err, sources, fields) {
    res.json(sources)
  })
})

module.exports = sources;
