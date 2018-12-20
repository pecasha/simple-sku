"use strict";
const path = require("path");
const webpack = require("webpack");
const uglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    entry: {
        app: "./src/main.js"
    },
    output: {
        path: path.resolve(__dirname, "../lib"),
        publicPath: "/",
        filename: "simple-sku.js",
        library: "Sku",
        libraryTarget: "assign",
        umdNamedDefine: true
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: "'production'"
            }
        }),
        new uglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false,
                    drop_debugger: true,
                    drop_console: true
                }
            },
            parallel: true
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "eslint-loader",
                enforce: "pre",
                options: {
                    formatter: require("eslint-friendly-formatter"),
                    emitWarning: false
                }
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            }
        ]
    }
};