import { rspack } from '@rspack/core'
import { RspackDevTools } from '@rspack-devtools/core'

/** @type {import('@rspack/cli').Configuration} */
export default {
  entry: {
    main: './src/index.jsx',
  },
  output: {
    filename: '[name].[contenthash:8].js',
    clean: true,
  },
  devServer: {
    port: 9300,
    historyApiFallback: true,
    setupMiddlewares(middlewares) {
      middlewares.unshift({
        name: 'devtools-inject-proxy',
        path: '/devtools-inject.js',
        middleware: async (req, res) => {
          try {
            const resp = await fetch('http://127.0.0.1:7821/devtools-inject.js')
            const text = await resp.text()
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
            res.setHeader('Cache-Control', 'no-cache')
            res.end(text)
          }
          catch {
            res.statusCode = 502
            res.end('DevTools server not ready')
          }
        },
      })
      return middlewares
    },
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
    RspackDevTools({ port: 7821, clientAuth: false }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  experiments: {
    css: true,
  },
}
