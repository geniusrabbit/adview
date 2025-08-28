import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'es2018',
  clean: true,
  minify: !options.watch,
  sourcemap: Boolean(options.watch),
  outDir: 'dist',
  dts: {
    resolve: true,
    tsconfig: './tsconfig.json',
  },
  external: ['react', 'react-dom', '@adview/popunder'],
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
  banner: {
    js: '/* @adview/react-popunder - React PopUnder Component */',
  },
}));
