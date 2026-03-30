---
"@rspack-devtools/core": patch
"rsdevtools": patch
---

Fix CJS crash where `fileURLToPath` received `undefined` from the `import.meta.url` shim (e.g. WASI/sandbox). Resolve module directory and `createRequire` via `__filename` when available.
