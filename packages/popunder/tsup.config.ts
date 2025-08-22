import { defineConfig } from 'tsup';
import dotenv from 'dotenv';

dotenv.config();

const popunderDefaultUrlName = 'POPUNDER_DEFAULT_URL';

export default defineConfig(options => ({
  entry: ['src/popunder.ts'],
  format: ['iife'],
  target: 'es5',
  clean: true,
  minify: !options.watch,
  sourcemap: Boolean(options.watch),
  outDir: 'dist',
  globalName: 'popunder',
  outExtension: () => ({ js: '.js' }),
  define: {
    [`process.env.${popunderDefaultUrlName}`]: JSON.stringify(
      process.env[popunderDefaultUrlName],
    ),
  },
  banner: {
    js: '/* PopUnder Script - AdView Team */',
  },
}));
