var mysqlModel = require('mysql-model');
var db_settings = require('../config/db.js').config();

var MyAppModel = mysqlModel.createConnection(db_settings);

var Tests = MyAppModel.extend({
  tableName: "tests",
});

Tests.findById = function(id, callback) {
  var tests = new Tests();
  tests.find('first', {where: 'id='+id}, callback);
}

Tests.findBySourceId = function(source_id, callback) {
  var tests = new Tests()
  tests.find('all', {where: `source_id = '${source_id}'`}, callback)
}

Tests.findAll = function(callback) {
  var tests = new Tests()
  tests.find('all', callback)
}

module.exports = Tests;
