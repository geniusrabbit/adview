import { preserveDirectivesPlugin } from 'esbuild-plugin-preserve-directives';
import { defineConfig, Options } from 'tsup';

const cfg: Options = {
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  splitting: false,
  bundle: true,
  minify: false,
  sourcemap: true,
  target: 'es2022',
  external: ['react'],
};

const plugin: any = preserveDirectivesPlugin({
  directives: ['use client', 'use strict'],
  include: /\.(js|ts|jsx|tsx)$/,
  exclude: /node_modules/,
});

export default defineConfig([
  {
    ...cfg,
    entry: [
      'src/AdViewUnit/*.tsx',
      'src/AdViewUnit/*.ts',
      'src/index.ts',
      'src/server.ts',
    ],
    esbuildPlugins: [plugin],
    outDir: 'dist',
  },
]);
