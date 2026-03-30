# Rspack official React starter (rstack-examples)

Upstream: [rstackjs/rstack-examples — `rspack/react`](https://github.com/rstackjs/rstack-examples/tree/main/rspack/react)

This copy matches that layout (Create React App–style `App` + SWC + asset rules) and adds **`rsdevtools`** via `RspackDevToolsPlugin` in `rspack.config.js`.

The **floating dock** is automatically injected into the HTML by `RspackDevToolsPlugin` — no manual script tags needed.

```bash
pnpm --filter rspack-devtools-example-rstack-official-react dev
```

Dev server: port **3203** (see `rspack.config.js`).
