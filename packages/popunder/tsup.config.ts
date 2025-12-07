import dotenv from 'dotenv';
import { defineConfig } from 'tsup';

dotenv.config();

const popunderDefaultUrlName = 'POPUNDER_DEFAULT_URL';

// IIFE version for direct usage in browsers
export default defineConfig([
  {
    entry: {
      ptl: 'src/ad-popunder.ts',
    },
    format: ['iife'],
    target: 'es5',
    clean: true,
    minify: true,
    sourcemap: false,
    outDir: 'dist',
    globalName: 'Popunder',
    outExtension: () => ({ js: '.js' }),
    define: {
      [`process.env.${popunderDefaultUrlName}`]: JSON.stringify(
        process.env[popunderDefaultUrlName],
      ),
    },
    banner: {
      js: '/* PopUnder Script - AdView Team */',
    },
  },
  // ES Module & CommonJS versions for bundlers
  // {
  //   entry: {
  //     'ptl.pkg': 'src/index.ts',
  //   },
  //   format: ['esm', 'cjs'],
  //   target: 'es2018',
  //   clean: false,
  //   minify: false,
  //   sourcemap: false,
  //   outDir: 'dist',
  //   dts: true,
  //   outExtension: ({ format }) => ({
  //     js: format === 'cjs' ? '.cjs' : '.mjs',
  //   }),
  //   define: {
  //     [`process.env.${popunderDefaultUrlName}`]: JSON.stringify(
  //       process.env[popunderDefaultUrlName],
  //     ),
  //   },
  //   banner: {
  //     js: '/* PopUnder Module - AdView Team */',
  //   },
  // },
]);
