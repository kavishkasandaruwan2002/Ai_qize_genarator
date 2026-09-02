# Setup and Configuration Guide: shadcn, Tailwind CSS, & TypeScript

This guide provides step-by-step instructions to add full **TypeScript** support, install/configure the **shadcn/ui CLI**, and review the **Tailwind CSS v4** setup for the StudyAI client application.

---

## 1. Project Component Paths & Directory Structure

### Default Paths
* **Components Directory**: `src/components` (domain-specific composite components like `PDFUpload.jsx`, `Layout.jsx`, etc.)
* **Low-Level UI Components**: `src/components/ui` (reusable atom-level primitives like buttons, shapes, inputs)
* **Styles**: `src/index.css` (Tailwind CSS v4 entry point)
* **Libraries & Helpers**: `src/lib/utils.js` / `src/lib/utils.ts` (contains the dynamic tailwind class merging `cn` function)

### Why is `/components/ui` important?
1. **Separation of Concerns**: Atom-level primitives (buttons, dialogs, sliders) are kept separate from page-level or logic-heavy domain components (e.g., quiz views). This prevents cluttering your main folder.
2. **CLI Standards**: The `shadcn` CLI (via `npx shadcn@latest add <component>`) targets `src/components/ui` by default to download code directly. Having this structure is standard and expected for imports.
3. **Reusability & Isolation**: Base UI components in `ui/` should remain generic and reusable across any page without holding component-specific business logic.

---

## 2. Transitioning the Project to TypeScript (Recommended)

To migrate the Vite codebase from JavaScript to TypeScript:

### Step 1: Install TypeScript and types
Run this command inside the `client` directory:
```bash
npm install -D typescript @types/react @types/react-dom @types/node
```

### Step 2: Initialize TSConfig
Create a `tsconfig.json` at the root of the `client` directory:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    /* Path Aliasing */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### Step 3: Configure Vite for TypeScript
In `vite.config.js` (rename to `vite.config.ts` if migrating fully):
1. Install Vite TS configuration if you want path resolution typescript support:
   ```bash
   npm install -D vite-tsconfig-paths
   ```
2. Adjust `vite.config.ts`:
   ```typescript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import tailwindcss from '@tailwindcss/vite';
   import path from 'path';

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

### Step 4: Rename files
Gradually rename `.jsx` files to `.tsx` and `.js` files to `.ts`. The bundler will automatically compile them.

---

## 3. Configuring shadcn CLI

Since this project uses **Tailwind CSS v4** (which doesn't require a traditional `tailwind.config.js` file and configures theme extensions inside `index.css` via `@theme` directives), we initialize shadcn manually or using the custom configuration template.

### Step 1: Install the UI CLI
Install shadcn CLI utilities:
```bash
npm install -D tailwindcss-animate
```

### Step 2: Create a `components.json` File
Create `components.json` in the root of the `client` folder to let shadcn know where components go:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "", 
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Step 3: Add shadcn Components
You can now add any shadcn primitive using the CLI:
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```
The CLI will automatically read the configuration and write components to `src/components/ui/`.
