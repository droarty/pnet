var mysqlModel = require('mysql-model');
var db_settings = require('../config/db.js').config();

var MyAppModel = mysqlModel.createConnection(db_settings);

var Source = MyAppModel.extend({
  tableName: "tblsitemaster",
});

Source.findById = function(id, callback) {
  var source = new Source();
  source.find('first', {where: 'id='+id}, callback);
}

Source.findByTableName = function(queryString, callback) {
  var source = new Source()
  source.find('all', {where: `table_name like '${queryString}%'`}, callback)
}

Source.findAll = function(queryString, callback) {
  var source = new Source()
  source.find('all', callback)
}

Source.findBySourceCityOrDistrict = function(sourceName, city, district, callback) {
  var source = new Source()
  var separator = ''
  var primaryQuery = ''
  var secondaryQuery = ''
  if (sourceName && sourceName.length > 2) {
    primaryQuery = `schlabel like '${sourceName}%'`
    secondaryQuery = `schlabel like '%${sourceName}%'`
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
    source.query(query, callback)
  }
  else {
    callback('No results', [])
  }
}

module.exports = Source;
