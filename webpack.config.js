const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const NODE_ENV = process.env.NODE_ENV || 'development';
const isPro = NODE_ENV === 'production';

const confName = process.env.NODE_BUILD_CONF_NAME || 'dev';

const conf = require('./config/' + confName);
const package = require('./package.json');
const setup = require('./setup');

var bundleName = conf.bundleName;
var chunkName = conf.chunkName;
var optimization;

var outputPath, publicPath, cssRule;
if(confName === 'dev' && !isPro){ //使用 命令weblack
  outputPath = path.join(__dirname, conf.indexDir, '/dist/dev/build');
  publicPath = conf.baseUrl + '/dist/dev/build/';
  cssRule = {
    test: /(\.scss$)|(\.css$)/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
    include: path.join(__dirname, './src')
  }

}else{
  outputPath = path.join(__dirname, conf.indexDir, '/build');
  publicPath = conf.baseUrl + '/build/';
  cssRule = {
    test: /(\.scss$)|(\.css$)/,
    //use: ["css-loader", "postcss-loader", "sass-loader"]
    use: [
      { 
        loader: MiniCssExtractPlugin.loader
      },
      
      "css-loader",  "sass-loader"
    ]
  }

}

var indexData = conf.indexData || {};
indexData.BASE_URL = conf.baseUrl;
indexData.VERSION = package.version;

// ***************************** plugins *****************************
var plugins = [
  new VueLoaderPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(NODE_ENV)
    }
  }),

  // create index.html
  new HtmlWebpackPlugin({
    chunksSortMode: 'dependency',
    filename: path.join(__dirname, conf.indexDir + '/index.html'),
    template: path.join(__dirname, '/src/index.ejs'),
    nodeModuleStatic : setup.nodeModuleStatic,
    indexData
  })
]
var rules = [
  {
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/
  },
  {
    test: /\.jade$/,
    loader: 'pug-plain-loader'
  },
  {
    test: /\.vue$/,
    loader: 'vue-loader'
  },
  cssRule
]
// ***************************** 环境适配 *****************************
if (isPro) {
  optimization = {
    minimizer: [
      new UglifyJsPlugin(),
      new OptimizeCSSAssetsPlugin({})
    ]
  }

  plugins = plugins.concat([//正式环境下压缩
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "styles_[name]_[contenthash].css",
      chunkFilename: "chunk_[id]_[contenthash].css"
    }),

    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //   },
    //   sourceMap: false,
    //   output: {
    //     comments: false,
    //   }
    // }),

    new webpack.LoaderOptionsPlugin({
      minimize: true
    })

  ]);

  // -------- pre lint --------
  rules.unshift({
    enforce: "pre",
    test: /(\.js|\.vue)$/,
    include: [path.resolve(__dirname, "src")],
    loader: "eslint-loader"
  })

};

// ***************************** conf *****************************
const webpackConf = {
  mode: NODE_ENV,
  optimization,
  context: path.join(__dirname, './src'),
  entry: {
    z_app: "./app.js"
  },
  output: {
    path: outputPath,
    publicPath,
    filename: bundleName,
    chunkFilename: chunkName
  },
  module: {
    rules
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '__ROOT__' : path.join(__dirname, './src')
    }
  },
  plugins: plugins,
  devServer: {
    before: setup,
    contentBase: path.join(__dirname, conf.indexDir),
    hot: true,
    noInfo: true
  },
  performance: {
    hints: false
  }
};

module.exports = webpackConf;