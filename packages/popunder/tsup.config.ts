import { defineConfig } from 'tsup';
import dotenv from 'dotenv';

dotenv.config();

const popunderDefaultUrlName = 'POPUNDER_DEFAULT_URL';

export default defineConfig(options => [
  // IIFE версия для браузера (существующая функциональность)
  {
    entry: ['src/ad-popunder.ts'],
    format: ['iife'],
    target: 'es5',
    clean: true,
    minify: !options.watch,
    sourcemap: Boolean(options.watch),
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
  // ES Module и CommonJS версии для импорта в других пакетах
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    target: 'es2018',
    clean: false,
    minify: !options.watch,
    sourcemap: Boolean(options.watch),
    outDir: 'dist',
    dts: {
      tsconfig: './tsconfig.json',
    },
    outExtension: ({ format }) => ({
      js: format === 'cjs' ? '.cjs' : '.mjs',
    }),
    define: {
      [`process.env.${popunderDefaultUrlName}`]: JSON.stringify(
        process.env[popunderDefaultUrlName],
      ),
    },
    banner: {
      js: '/* PopUnder Module - AdView Team */',
    },
  },
]);
