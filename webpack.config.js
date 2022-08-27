/**
 * Install tools
 * npm install webpack -g
 * npm install terser -g
 * npm install terser-webpack-plugin --save-dev
 * 
 * then call "webpack" from command line
 */

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const devMode = (process.env.NODE_ENV === 'development');
console.log(`${devMode ? 'development' : 'production'} mode bundle`);

// only CORE, no UI components
const core = {
  mode : devMode ? 'development' : 'production',
  entry: './modules/index.mjs',
  devtool: 'source-map',
  output: {
    filename: 'io.greenscreens.components.core.js',
    path: path.resolve(__dirname, 'release'),
  },
  optimization: {
    minimize: devMode === false,
    minimizer: [
      new TerserPlugin({ parallel: true,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true
        },      
      })
    ],  
  }
};

// complete library, UI+CORE
const all = {
  mode : devMode ? 'development' : 'production',
  entry: './modules/components/index.mjs',
  devtool: 'source-map',
  output: {
    filename: 'io.greenscreens.components.all.js',
    path: path.resolve(__dirname, 'release'),
  },
  optimization: {
    minimize: devMode === false,
    minimizer: [
      new TerserPlugin({ parallel: true,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true
        },      
      })
    ],  
  }
};

module.exports = [core, all];
