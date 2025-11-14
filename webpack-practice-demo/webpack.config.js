const HtmlWebpackPlugin = require('html-webpack-plugin')
// 引入path模块
const path = require('path')
// // 方式一：resolve获得当前路径
// console.log(path.resolve())
// // 方式二：join拼接路径
// console.log(path.join(__dirname, './dist'))

const config = {
    entry: './index.js',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, './dist')
    },
    module: {
      rules: [
        {
          test: /(.scss|.sass)$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /.(jpe?g|png|gif|svg)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
              limit: 10000,
              name: '[name].[ext]',
              outputPath: 'imgs/'
              }
            }
          ]
        },
      ]
    },
   	plugins: [
      new HtmlWebpackPlugin({
        template: 'index-dev.html',  // 指定 HTML 模板文件 在根目录下创建index.html作为模板文件
        filename: 'index.html',     // 输出的 HTML 文件名（默认也是 index.html）
      })
   	],
    devServer: {
      hot: true
    }
}

module.exports = config
