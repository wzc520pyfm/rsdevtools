const { rspack } = require('@rspack/core')
const { RspackDevToolsPlugin } = require('rsdevtools')

/** @type {import('@rspack/cli').Configuration} */
module.exports = {
  entry: {
    main: './src/index.jsx',
  },
  output: {
    filename: '[name].[contenthash:8].js',
    clean: true,
  },
  devServer: {
    port: 3201,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: true,
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.css$/,
        type: 'css',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    new RspackDevToolsPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  experiments: {
    css: true,
  },
}
