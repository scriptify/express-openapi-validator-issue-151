const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const { PATHS, getAliases, getEnvVars } = require('./util');

const isServerless = !!!process.env.APP_PATH;
const entry = !isServerless ? PATHS.src : slsw.lib.entries;
const output = isServerless
  ? undefined
  : {
      path: PATHS.build,
    };

const { SERVER: envVars } = getEnvVars(isServerless ? '../.env' : '.env');
const babelConfig = JSON.parse(
  fs.readFileSync(
    isServerless ? path.join(__dirname, '../.babelrc') : '.babelrc',
  ),
);

const node = isServerless
  ? undefined
  : {
      __dirname: true,
    };

module.exports = {
  entry,
  output,
  node,
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  externals: [
    nodeExternals({
      modulesDir: isServerless
        ? path.resolve('../node_modules')
        : path.resolve('node_modules'),
    }),
  ],
  resolve: {
    alias: getAliases(),
    extensions: [
      '.web.js',
      '.mjs',
      '.js',
      '.json',
      '.web.jsx',
      '.ts',
      '.tsx',
      '.d.ts',
    ],
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: [/\.js$/, /\.tsx?$/],
        include: [PATHS.src, PATHS.shared],
        use: {
          loader: 'babel-loader',
          options: babelConfig,
        },
      },
    ].filter(obj => obj),
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      ...envVars,
      STAGE: process.env.STAGE,
    }),
    !isServerless
      ? new NodemonPlugin({
          ignore: ['./temp/'],
          ext: 'js,graphql,ts,ps1',
          nodeArgs: ['--inspect'],
        })
      : undefined,
    PATHS.static
      ? new CopyPlugin([
          {
            from: PATHS.src,
            to: PATHS.build,
          },
        ])
      : undefined,
  ].filter(el => el),
};
