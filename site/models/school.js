var mysqlModel = require('mysql-model');
var db_settings = require('../config/db.js');

var MyAppModel = mysqlModel.createConnection(db_settings);

var School = MyAppModel.extend({
  tableName: "tblsitemaster",
});

School.findById = function(id, callback) {
  var school = new School();
  school.find('first', {where: 'id='+id}, callback);
}

School.findByName = function(queryString, callback) {
  var school = new School()
  school.find('all', {where: `schname like '${queryString}%'`}, callback)
}

School.findBySchoolCityOrDistrict = function(school, city, district, callback) {
  var school = new School()
  var separator = ''
  var primaryQuery = ''
  var secondaryQuery = ''
  if (school && school.length > 2) {
    primaryQuery = `schlabel like '${school}%'`
    secondaryQuery = `schlabel like '%${school}%'`
    separator = ' and '
  }
  if (city && city.length > 1) {
    primaryQuery += separator + `city like '${city}%'`
    secondaryQuery += separator + `city like '%${city}%'`
    separator = 'and'
  }
  if (district && district.length > 0) {
    primaryQuery += separator + `district like '${district}%'`
    secondaryQuery += separator + `district like '%${district}%'`
    separator = 'and'
  }
  var query = `select cdts, schLabel, city, district, rank from (
  SELECT cdts, schLabel, city, district, 1 rank
  FROM tblsitemaster
  where ${primaryQuery}
  union
  SELECT cdts, schLabel, city, district, 2 rank
  FROM tblsitemaster
  where ${secondaryQuery}
  ) z order by rank, schLabel, city`
  if (primaryQuery) {
    school.query(query, callback)
  }
  else {
    callback('No results', [])
  }
}

module.exports = School;


// create a school model
// var School = mongoose.model('School', {
//   oauthID: Number,
//   name: String,
//   created: Date
// });
