var path = require('path');

module.exports = {
  entry: {
    bundle: path.resolve('app/app.jsx')
  },
  output: {
    path: path.resolve('public'),
    filename: 'static/[name].js'
  },
  resolve: {
    root: path.resolve('.')
  },
  module: {
    loaders: require('./webpack_loaders.js')
  }
};
