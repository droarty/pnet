var schools = require('./api/schools.js');
var sources = require('./api/sources.js');
var normalized = require('./api/normalized.js');

routes_for_server = function(app) {
  app.use('/api/schools', schools);

  app.use('/api/sources', sources);

  app.use('/api/normalized', normalized);
}

module.exports = routes_for_server;
