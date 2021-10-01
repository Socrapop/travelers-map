const path = require('path');

module.exports = {
  entry: './includes/public/js/travelersmap.js',
  output: {
    filename: 'travelersmap-bundle.js',
    path: path.resolve(__dirname, './includes/public/js/dist'),
  },
  optimization: {
    minimize: false,
  },
};
