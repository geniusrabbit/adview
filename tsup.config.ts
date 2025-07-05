import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'index.ts',
    utils: 'utils/index.ts', 
    typings: 'typings/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  minify: false,
  target: 'es2020',
  outDir: 'dist'
});
