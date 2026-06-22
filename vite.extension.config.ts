import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {
  existsSync,
  rmSync,
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

const cleanBeltWizardAssets: Plugin = {
  name: "clean-belt-wizard-assets",
  apply: "build",
  buildStart() {
    const assetsDir = "extensions/belt-wizard/assets";
    if (existsSync(assetsDir)) {
      rmSync(assetsDir, { recursive: true, force: true });
    }
    mkdirSync(assetsDir, { recursive: true });
  },
};

const copyBeltWizardStaticAssets: Plugin = {
  name: "copy-belt-wizard-static-assets",
  apply: "build",
  buildStart() {
    const to = "extensions/belt-wizard/assets";

    cpSync("theme-extension-src/assets/theme.css", `${to}/theme.css`, {
      force: true,
    });
    cpSync(
      "theme-extension-src/assets/open-wc-logo.svg",
      `${to}/open-wc-logo.svg`,
      { force: true },
    );
    cpSync("theme-extension-src/assets/logo.png", `${to}/logo.png`, {
      force: true,
    });
    cpSync("theme-extension-src/assets/logo@2x.png", `${to}/logo@2x.png`, {
      force: true,
    });
    cpSync("theme-extension-src/assets/belts", `${to}/belts`, {
      recursive: true,
      force: true,
    });

    const faviconPath = "extensions/belt-wizard/assets/favicon.ico";
    if (existsSync(faviconPath)) rmSync(faviconPath);
  },
};

const createCombinedCSS: Plugin = {
  name: "create-combined-css",
  apply: "build",
  closeBundle() {
    const themeCSS = readFileSync(
      "theme-extension-src/assets/theme.css",
      "utf-8",
    );
    writeFileSync(
      "extensions/belt-wizard/assets/belt-wizard.css",
      themeCSS,
    );
  },
};

export default defineConfig({
  plugins: [
    cleanBeltWizardAssets,
    copyBeltWizardStaticAssets,
    createCombinedCSS,
    tsconfigPaths(),
  ],
  build: {
    outDir: "extensions/belt-wizard/assets",
    emptyOutDir: false,
    copyPublicDir: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        "belt-wizard": "theme-extension-src/belt-wizard.ts",
      },
      output: {
        format: "iife",
        name: "BeltWizard",
        inlineDynamicImports: true,
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
    sourcemap: true,
    minify: "esbuild",
    cssCodeSplit: false,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
