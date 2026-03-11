import { RspackDevToolsPlugin } from '@rspack-devtools/core'

/** @type {import('@rspack/cli').Configuration} */
export default {
  entry: {
    main: './src/index.jsx',
  },
  output: {
    filename: '[name].[contenthash:8].js',
    clean: true,
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
    new RspackDevToolsPlugin({
      open: true,
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  experiments: {
    css: true,
  },
}
