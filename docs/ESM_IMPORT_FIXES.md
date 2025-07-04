# ESM Import Fixes

## Overview

This document outlines the fixes made to handle ESM imports correctly throughout the AffluentEdge codebase.

## Issues Fixed

1. **Double Extension Issue**: Many imports were incorrectly using double `.js.js` extensions, which prevented proper module resolution.

2. **TypeScript Configuration**: The `tsconfig.client.json` file was using `moduleResolution: "bundler"` which was incompatible with the `module: "nodenext"` setting in the base configuration.

3. **Implicit Any Types**: Several components had TypeScript errors related to implicit `any` types, particularly in callback functions.

## Solutions Implemented

### 1. Import Path Corrections

- Fixed all double `.js.js` extensions to be single `.js` extensions in import statements
- Created and ran a script (`scripts/fix-double-js-extensions.sh`) to automatically find and fix these issues across the entire codebase

### 2. TypeScript Configuration Update

Updated `tsconfig.client.json` to use:
```json
{
  "moduleResolution": "NodeNext"
}
```
instead of:
```json
{
  "moduleResolution": "bundler"
}
```

This ensures consistency with the base `tsconfig.json` settings.

### 3. Type Annotations

Added proper type annotations to resolve implicit `any` type errors, for example:

```typescript
// Before
.sort((a, b) => new Date(a.snapshotTime).getTime() - new Date(b.snapshotTime).getTime())

// After
.sort((a: PortfolioSnapshot, b: PortfolioSnapshot) => new Date(a.snapshotTime).getTime() - new Date(b.snapshotTime).getTime())
```

## Future Considerations

1. **Extension Handling**: When creating new imports in TypeScript files, always include the `.js` extension for local imports, even though the actual file has a `.ts` or `.tsx` extension. This is required for ESM compatibility.

2. **Automation**: Consider integrating the extension fixing script into the build process or as a pre-commit hook to prevent these issues from recurring.

3. **Path Aliases**: While the codebase currently supports path aliases like `@/*`, these can sometimes cause issues with ESM imports. If problems persist, consider using relative imports consistently.

4. **Type Checking**: Run `npx tsc -p tsconfig.client.json --noEmit` regularly to catch type errors early.
