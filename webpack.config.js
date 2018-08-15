// NOTE: paths are relative to each functions folder
const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'none',
    entry: './main.js',
    output: {
        path: process.cwd(),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    target: 'node',
    externals: ['webpack', 'webpack-cli']
};