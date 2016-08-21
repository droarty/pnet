var mysqlModel = require('mysql-model');
var db_settings = require('../config/db.js').config();

var MyAppModel = mysqlModel.createConnection(db_settings);

var Source = MyAppModel.extend({
  tableName: "sources",
});

Source.findById = function(id, callback) {
  var source = new Source();
  source.find('first', {where: 'id='+id}, callback);
}

Source.findByTableName = function(queryString, callback) {
  var source = new Source()
  source.find('all', {where: `table_name like '${queryString}%'`}, callback)
}

Source.findAll = function(callback) {
  var source = new Source()
  source.find('all', callback)
}

Source.findAllWithSummary = function(callback) {
  var source = new Source()
  var query = `select * from sources`

  source.query(query, function(errors, results, fields) {
    var joinedQuery = ""
    var sep = ""
    results.forEach(function(source) {
      var where = ` where ${source.score_field} is not null `
      if (source.subject_field) {
        where += ` and ${source.subject_field} = '${source.subject_value}' `
      }
      joinedQuery += `${sep}select '${source.subject}' subject, '${source.source_name}' source_name, ${source.grade_level_field} grade_level, ${source.year_field} year, count(*) cnt from ${source.table_name} ${where} group by ${source.grade_level_field}, ${source.year_field}`
      sep = " union "
    })
    source.query(joinedQuery, callback)
  })
}

module.exports = Source;
