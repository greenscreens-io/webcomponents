const path = require('path');

const devMode = (process.env.NODE_ENV === 'development');
console.log(`${devMode ? 'development' : 'production'} mode bundle`);

module.exports = {
  mode : devMode ? 'development' : 'production',
  entry: './release/io.greenscreens.components.js',
  output: {
    filename: 'io.greenscreens.components.es5.js',
    path: path.resolve(__dirname, 'release'),
  },
};