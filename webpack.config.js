const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    
    entry: path.join(__dirname, './js/main.js'),
    
    output: {
        path: path.join(__dirname, './build/'),
        filename: "[name].js",
        publicPath: "/build/"
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        'scss': [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader'
                        ]
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            presets: ['@babel/env']
                        }
                    }
                ],
            },
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: "vue-style-loader" // creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass")
                        }
                    }
                ]
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg|jpg|gif)$/, 
                loader: 'url-loader?limit=100000' 
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [
              { from : 'vendor/CommonUI/public', to: ''}
            ]
        })
    ],

    node: {
        fs: 'empty'
    },

    resolve:{
        alias: {
            commonui: path.resolve(__dirname, 'vendor/CommonUI/'),
            'vue$': 'vue/dist/vue.esm.js'
        },

        extensions: ['*', '.js', '.vue', '.json']
    },

    externals: {
        "ddb": "DDB",
        "appInfo": "APPINFO",
        "mfs": "MFS"
    }
}
