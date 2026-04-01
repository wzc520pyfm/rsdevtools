# rsdevtools

## 0.1.2

### Patch Changes

- e3fda0d: Suppress DevTools terminal banner by default; add `print` option to opt in
- Updated dependencies [e3fda0d]
  - @rspack-devtools/core@0.1.2

## 0.1.1

### Patch Changes

- 4841fb2: Fix CJS crash where `fileURLToPath` received `undefined` from the `import.meta.url` shim (e.g. WASI/sandbox). Resolve module directory and `createRequire` via `__filename` when available.
- Updated dependencies [4841fb2]
  - @rspack-devtools/core@0.1.1

## 0.1.0

### Minor Changes

- Auto-inject devtools dock script into HTML via HtmlRspackPlugin hook. Users no longer need to manually add script tags to their index.html.

### Patch Changes

- Updated dependencies
  - @rspack-devtools/core@0.1.0

## 0.0.2

### Patch Changes

- 8806e2d: update changset conf
- a2a96bc: update release script
- Updated dependencies [8806e2d]
- Updated dependencies [a2a96bc]
  - @rspack-devtools/core@0.0.2
