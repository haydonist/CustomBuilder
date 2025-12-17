import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // Build for Shopify Theme App Extension
    lib: {
      entry: resolve(__dirname, 'src/belt-wizard.ts'),
      name: 'BeltWizard',
      formats: ['iife'],
      fileName: () => 'belt-wizard.js',
    },
    outDir: 'extensions/belt-wizard-block/assets',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        // Ensure all code is bundled into a single file
        inlineDynamicImports: true,
        // Global variable name for IIFE
        name: 'BeltWizard',
        // Don't externalize any dependencies
        globals: {},
      },
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Minify for production
    minify: 'terser',
  },
  // Define environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
