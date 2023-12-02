/* eslint-disable */
import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import pkg = require('./package.json');
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'SimPhiVite',
      formats: ['es'],
      fileName: `script-${pkg.version}`
    },
    sourcemap: true,
    cssTarget: 'chrome61',
    rollupOptions: {
      external: [/^\/utils\//],
      output: {
        plugins: [
          getBabelOutputPlugin({
            plugins: [['@babel/plugin-transform-nullish-coalescing-operator']]
          }),
          terser({ compress: { passes: 3 } })
        ]
      }
    }
  },
  preview: {
    host: true,
    port: 4173
  }
});
