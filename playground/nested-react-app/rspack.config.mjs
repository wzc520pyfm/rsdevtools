import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rspack } from '@rspack/core'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Minimal React demo — separate port from main playground (9300). No DevTools here. */
/** @type {import('@rspack/cli').Configuration} */
export default {
  entry: {
    main: './src/main.jsx',
  },
  output: {
    filename: '[name].[contenthash:8].js',
    path: join(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    port: 9301,
    hot: true,
    historyApiFallback: true,
    /**
     * DevTools dock embeds this app in an iframe from another origin (e.g. :9300 or :7821).
     * Dev server defaults often set X-Frame-Options: SAMEORIGIN, which blocks cross-origin
     * iframes → blank panel after Launch.
     */
    headers: {
      'Content-Security-Policy': 'frame-ancestors *',
    },
    setupMiddlewares(middlewares) {
      middlewares.unshift({
        name: 'rspack-devtools-allow-cross-origin-iframe',
        middleware: (_req, res, next) => {
          const setHeader = res.setHeader.bind(res)
          res.setHeader = (name, value) => {
            if (String(name).toLowerCase() === 'x-frame-options')
              return res
            return setHeader(name, value)
          }
          next()
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
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  experiments: {
    css: true,
  },
}
