const fs = require('fs');
const node_modules = fs.readdirSync('node_modules').filter(x => x !== '.bin');
const globby = require('globby');
const path = require('path')


fs.writeFileSync('test/all.ts',
 globby.sync(['test/**/*-test.ts', 'test/**/*-test.tsx'])
   .map(file => file.replace('test/', '').replace(/\.tsx?$/, ''))
   .map(file => `import './${file}';`)
   .join('\n'));

module.exports = [
{
  target: 'node',
  entry: './src/server',
  output: {
    path: __dirname + '/dist',
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  externals: node_modules,
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.webpack.js', '.web.js', '.js']
  }
},
{
  target: 'node',
  entry: './test/etcd_daemon.ts',
  output: {
    filename: './dist/etcd_daemon.js'
  },
  module: {
    loaders: [
      {
        test: /etcd_daemon\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  externals: node_modules,
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts']
  }
},
{
  target: 'node',
  entry: './test/all',
  output: {
    path: __dirname + '/dist',
    filename: 'test.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  externals: node_modules,
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.webpack.js', '.web.js', '.js']
  }
}];
