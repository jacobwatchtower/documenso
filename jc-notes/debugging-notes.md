# JC Debugging Notes

## 2026-01-13: react-router-dom version mismatch error

### Problem
When running `npm run dev`, got errors like:
```
No matching export in "react-router/dist/development/index.mjs" for import "UNSAFE_logV6DeprecationWarnings"
No matching export for import "defer"
No matching export for import "json"
```

These are react-router v6 APIs that don't exist in v7.

### Root Cause
A stale `node_modules` folder existed in the home directory (`/Users/jacobcolling/node_modules/react-router-dom`) with an old v6 version of react-router-dom.

Node's module resolution walks up the directory tree looking for `node_modules` folders. When Vite/esbuild couldn't find `react-router-dom` in the project (because v7 unified everything into just `react-router`), it found the old v6 version in the home directory.

### Solution
```bash
rm -rf /Users/jacobcolling/node_modules
```

### Lesson Learned
If you get mysterious dependency version mismatches that persist after `npm run reset:hard`, check for stale `node_modules` folders in parent directories (especially the home directory).

Use this command to find rogue installations:
```bash
find /Users/jacobcolling -name "react-router-dom" -type d 2>/dev/null | head -10
```
