var mysqlModel = require('mysql-model');
var db_settings = require('../config/db.js');

var MyAppModel = mysqlModel.createConnection(db_settings);

var User = MyAppModel.extend({
  tableName: "users",
});

User.findById = function(id, callback) {
  var user = new User();
  user.find('first', {where: 'id='+id}, callback);
}

module.exports = User;


// create a user model
// var User = mongoose.model('User', {
//   oauthID: Number,
//   name: String,
//   created: Date
// });
