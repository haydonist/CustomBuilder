import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, type Plugin, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { existsSync, rmSync, cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the Vite server.
// The CLI will eventually stop passing in HOST,
// so we can remove this workaround after the next major release.
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost")
  .hostname;

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT!) || 8002,
    clientPort: 443,
  };
}

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
    cpSync("theme-extension-src/assets/open-wc-logo.svg", `${to}/open-wc-logo.svg`, {
      force: true,
    });
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
    const themeCSS = readFileSync("theme-extension-src/assets/theme.css", "utf-8");
    writeFileSync("extensions/belt-wizard/assets/belt-wizard.css", themeCSS);
  },
};

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  const config = {
    server: {
      allowedHosts: [host, ".myshopify.com"],
      cors: {
        preflightContinue: true,
      },
      port: Number(process.env.PORT || 3000),
      hmr: hmrConfig,
      fs: {
        // See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
        allow: ["app", "node_modules"],
      },
    },
    plugins: isBuild
      ? [cleanBeltWizardAssets, copyBeltWizardStaticAssets, createCombinedCSS, tsconfigPaths()]
      : [reactRouter(), tsconfigPaths()],
    // Build for Shopify Theme App Extension
    build: {
      outDir: 'extensions/belt-wizard/assets',
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
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
      // Generate sourcemaps for debugging
      sourcemap: true,
      // Minify for production
      minify: 'esbuild',
      cssCodeSplit: false,
    },
    optimizeDeps: isBuild
      ? undefined
      : {
          include: ["@shopify/app-bridge-react"],
        },
    // Define environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        isBuild ? 'production' : 'development'
      ),
    }
  } satisfies UserConfig;

  return config;
});
