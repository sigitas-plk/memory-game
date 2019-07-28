const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    main: __dirname + "/js/browser.js",
    game: __dirname + "/js/game.js"
  },
  output: {
    filename: "[name].[hash].js",
    path: __dirname + "/dist"
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ]
      },
      {
        test: /\.png$/,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader",
            options: {
              optipng: {
                enabled: true
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin("dist", {
      root: path.resolve(__dirname)
    }),
    new HtmlWebpackPlugin({
      title: "simple game",
      template: "index.html"
    })
  ]
};
