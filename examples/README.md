# Examples

Minimal React + Rspack apps that use `rsdevtools`.

| Directory | Rspack | Config style | Dev server port |
|-----------|--------|--------------|-----------------|
| `esm/` | 1.x | ESM (`rspack.config.mjs`, `import`) | 3200 |
| `commonjs/` | 1.x | CommonJS (`rspack.config.cjs`, `require`) | 3201 |
| `rspack2/` | 2.x beta | ESM (`rspack.config.mjs`) | 3202 |
| `rstack-official-react/` | 2.x beta | CJS ([upstream React starter](https://github.com/rstackjs/rstack-examples/tree/main/rspack/react), `rspack.config.js`) | 3203 |

From the repo root:

```bash
pnpm install
pnpm --filter rspack-devtools-example-esm dev
pnpm --filter rspack-devtools-example-commonjs dev
pnpm --filter rspack-devtools-example-rspack2 dev
pnpm --filter rspack-devtools-example-rstack-official-react dev
```

Build all examples:

```bash
pnpm examples:build
```

`rspack2/` pins **Rspack 2.0** (`@rspack/core` / `@rspack/cli` `2.0.0-beta.9`). **`rstack-official-react/`** follows [rstack-examples `rspack/react`](https://github.com/rstackjs/rstack-examples/tree/main/rspack/react) (Rspack **2.0.0-beta.7** + `@rspack/dev-server`). Other examples use **Rspack 1.x**.

### Note on `rspack build`

With DevTools enabled, the build may print `Rspack compiled` but **keep the Node process running** (DevTools HTTP/WebSocket server). Stop with **Ctrl+C** when finished locally. CI may need a timeout or a separate “no DevTools” config until this is addressed in core.

### CommonJS (`require`)

`rsdevtools` resolves to the CJS build under `require()`. `@rspack-devtools/core` enables **tsup `shims`** so `import.meta.url` works in the CJS bundle; if you consume `@rspack-devtools/core` directly, use the same published CJS output.
