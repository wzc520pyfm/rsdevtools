# Troubleshooting & Common Issues

Known issues encountered during development and their solutions.

## Build Issues

### `No parser registered for 'jsx'`
**Cause**: Rspack needs explicit JSX loader configuration.
**Fix**: Add `builtin:swc-loader` with JSX options in `rspack.config.mjs`:
```js
module: {
  rules: [{
    test: /\.jsx$/,
    type: 'javascript/auto',
    use: [{
      loader: 'builtin:swc-loader',
      options: { jsc: { parser: { syntax: 'ecmascript', jsx: true } } }
    }]
  }]
},
resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'] }
```

### `Module not found: Can't resolve './App'`
**Cause**: Rspack doesn't resolve `.jsx` extensions by default.
**Fix**: Add `.jsx` to `resolve.extensions` in rspack config.

### `Cannot GET /` from dev server
**Cause**: Without `HtmlRspackPlugin`, the dev server doesn't serve `index.html`.
**Fix**: Add `new rspack.HtmlRspackPlugin({ template: './index.html' })` to plugins.

## Server Issues

### `EADDRINUSE: address already in use :::3200` (or :::7821)
**Cause**: Previous process didn't terminate cleanly.
**Fix**:
```bash
lsof -ti:3200 | xargs kill -9 2>/dev/null
lsof -ti:7821 | xargs kill -9 2>/dev/null
```

### `ERR_HTTP_HEADERS_SENT`
**Cause**: Attempting to modify response headers after they've been sent (common with middleware injection).
**Fix**: This is why rs-devtools uses a standalone `/devtools-inject.js` endpoint instead of HTML response interception. If you encounter this, avoid patching `res.write`/`res.end` in middleware.

### DevTools server doesn't start
**Cause**: `compiler.hooks.done` hasn't fired yet (no compilation).
**Fix**: The server starts on first successful compilation. Ensure the Rspack build completes. Check terminal output for `⬢ Rspack DevTools` banner.

## Client Issues

### "No build sessions yet" on page load
**Cause**: RPC calls fire before WebSocket connection is established.
**Fix**: The `waitForConnection()` pattern in `composables/rpc.ts` buffers calls until the socket is `OPEN`. If this regresses, check that the rpc proxy waits for connection before sending.

### Dock button (⚡) doesn't appear
**Cause**: Several possible causes:
1. DevTools server not running (script 404s)
2. `window.parent !== window` guard (you're inside an iframe)
3. JS error in the inject script
**Fix**: Check browser console for errors, verify `http://localhost:7821/devtools-inject.js` returns valid JS.

### WebSocket disconnects
**Cause**: Server restart or network interruption.
**Fix**: Client has built-in reconnection with exponential backoff. If reconnection fails, the status indicator in the UI shows "Disconnected".

## Dependency Issues

### `ERR_PNPM_OUTDATED_LOCKFILE`
**Fix**: `pnpm install --no-frozen-lockfile`

### `birpc` type mismatch
**Fix**: Use `ReturnType<typeof createBirpc<ClientFunctions, ServerFunctions>>` for the client type in `Set`.

### `tinyglobby` or `launch-editor` not found
**Fix**: These are runtime dependencies of `@rspack-devtools/core`. Ensure they're in `dependencies` (not `devDependencies`) in `packages/core/package.json`.

## Development Workflow Issues

### Changes to core not reflected
**Fix**: Core uses `tsup` for building. After editing `packages/core/src/`, always run `pnpm build:core` before restarting the example.

### Client UI changes not reflected
**Fix**: If running `pnpm dev:client`, Vite HMR should handle it. For production build, run `pnpm build:client` and restart.

### Module graph visualization too slow
**Cause**: Large number of modules creates too many D3 force simulation nodes.
**Fix**: Limit visible nodes (default 200), add search/filter before rendering, or use canvas renderer instead of SVG for >500 nodes.
