var express = require('express');
var School = require('../models/school.js');

var schools = express();

schools.get('/', function (req, res) {

  res.json({});
});



schools.get('/search', function (req, res) {
  var result = School.findBySchoolCityOrDistrict(req.query.school, req.query.city, req.query.district, function (err, schools, fields) {
    res.json(schools)
  })
})

module.exports = schools;