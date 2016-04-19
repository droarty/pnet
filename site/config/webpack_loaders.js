var WebpackLoaders = [
  {
    test: /\.jsx?$/,
    loader: 'babel',
    exclude: /node_modules/,
    query: {
      presets: ['es2015', 'react']
    }
  },
  {
    test: /\.scss$/,
    loaders: ["style", "css", "sass"],
    exclude: /node_modules/
  },
  {
    test: /\.css$/,
    loaders: ["style-loader", "css-loader"],
    exclude: /node_modules/
  },
  {
    test: /\.jpg$/,
    loaders: ["url?name=/static/images/[name].[ext]&limit=1&mimetype=image/jpg"],
    exclude: /node_modules/
  },
  {
    test: /\.png$/,
    loaders: ["url?name=/static/images/[name].[ext]&limit=1&mimetype=image/png"],
    exclude: /node_modules/
  }
];

module.exports = WebpackLoaders
