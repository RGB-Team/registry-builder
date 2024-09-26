# Custom Registry Builder Script Documentation

This document explains how to use the custom registry builder script to generate JSON registry files for UI components.

## Prerequisites

1. Ensure you have Node.js installed on your system.
2. The script uses ES modules, so make sure your `package.json` includes `"type": "module"`.

## Setup

1. Create a new file named `registry-builder.js` (or any preferred name) in your project.

2. Copy and paste the provided script code into this file.

3. Create a file to define your registries. For example, `registries.ts`:
-Note : this needs to be same level

```javascript
import { preReq } from "@/script/registry-builder/src/lib/schema";

export const Registries = [
  {
    "name": "tree-view",
    "dependencies": ["@tanstack/react-virtual", "use-resize-observer"],
    "registryDependencies": ["tree-view-api"],
    "path": "./registry/default/extension/tree-view.tsx",
    "type": "registry:ui",
    "docs": "https://shadcn-extension.vercel.app/docs/tree-view",
  },
  // ... (add other registry items here)
] satisfies preReq[];
```

4. Copy paste this to the package.json scripts  

```json
"build:registry": "tsup --tsconfig ./tsconfig.script.json ./src/index.ts --target es2022 --format cjs --clean --metafile & node ./dist/index.js",
```


5. Run the build:registry command script

```shell
pnpm build:registry
```

-Note: you can use any package manager, for our case we prefer to use pnpm

## Result 

![result](/assets/result.png)