import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rspack } from '@rspack/core'
import { RspackDevTools } from 'rsdevtools'

const __dirname = dirname(fileURLToPath(import.meta.url))
const nestedReactRoot = join(__dirname, 'nested-react-app')

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
    RspackDevTools({
      port: 7821,
      clientAuth: false,
      /**
       * Terminals：再起一个 Rspack dev（nested-react-app:9301）。
       * Dock iframe：打开 Rspack 官网（不嵌本地子服务，避免跨源 iframe 问题）。
       */
      launcher: {
        command: 'pnpm exec rspack serve',
        cwd: nestedReactRoot,
        title: 'Nested React',
        description: '在 Terminals 里启动 nested-react-app（端口 9301）；Launch 后本面板内嵌打开 rspack.rs（若官网禁止 iframe 则可能空白）。',
        openUrlAfterLaunch: 'https://rspack.rs/',
        iframeTitleAfterLaunch: 'Rspack',
        iframeIconAfterLaunch: 'ph:globe-duotone',
      },
    }),
    {
      name: 'playground-custom-dock',
      apply() {},
      devtools: {
        async setup(ctx) {
          ctx.views.hostStatic(
            '/.devtools-playground/',
            join(__dirname, 'src/devtools-client-scripts'),
          )
          ctx.docks.register({
            type: 'custom-render',
            renderer: {
              importFrom: '/.devtools-playground/custom-render.mjs',
            },
            id: 'custom-render',
            title: 'Custom',
            icon: 'ph:pencil-simple-duotone',
          })
        },
      },
    },
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  experiments: {
    css: true,
  },
}
