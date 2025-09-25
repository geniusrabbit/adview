import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    adViewNative: 'src/index.ts',
  },
  format: ['iife'],
  globalName: 'AdViewNative',
  dts: true,
  clean: true,
  sourcemap: false,
  minify: true,
  target: 'es2015',
  outDir: 'dist',
  external: [],
  splitting: false,
  treeshake: true,
  bundle: true,
  noExternal: ['@adview/core'],
  outExtension() {
    return {
      js: `.js`,
    };
  },
  esbuildOptions(options) {
    options.banner = {
      js: `/* AdView Native Package - https://github.com/geniusrabbit/adview */`,
    };
    options.platform = 'browser';
    options.mainFields = ['browser', 'module', 'main'];
    options.packages = 'bundle';
    options.define = {
      'process.env.ADSERVER_AD_JSONP_REQUEST_URL': JSON.stringify(
        process.env.ADSERVER_AD_JSONP_REQUEST_URL || '',
      ),
    };
  },
});
