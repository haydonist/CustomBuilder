import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

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

const hmrConfig =
  host === "localhost"
    ? {
        protocol: "ws" as const,
        host: "localhost",
        port: 64999,
        clientPort: 64999,
      }
    : {
        protocol: "wss" as const,
        host,
        port: parseInt(process.env.FRONTEND_PORT ?? "") || 8002,
        clientPort: 443,
      };

export default defineConfig({
  server: {
    allowedHosts: [host, ".myshopify.com"],
    cors: {
      preflightContinue: true,
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      allow: ["app", "node_modules"],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  optimizeDeps: {
    include: ["@shopify/app-bridge-react"],
  },
});
