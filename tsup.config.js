import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.js'],
  format: ['esm'],
  clean: true,
  dts: false,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
