import dotenv from 'dotenv';
import fsPromises from 'fs/promises';
import { generateScopedName } from 'hash-css-selector';
import path from 'path';
import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    ntl: 'src/index.ts',
    'ntl.styles': 'src/renders/StylizedRender.module.css',
  },
  format: ['iife'],
  globalName: 'ntl',
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
  loader: {
    '.css': 'local-css',
  },
  esbuildPlugins: [
    {
      name: 'css-module',
      setup(build): void {
        build.onResolve(
          { filter: /\.module\.css$/, namespace: 'file' },
          args => {
            return {
              path: `${args.path}#css-module`,
              namespace: 'css-module',
              pluginData: {
                pathDir: path.join(args.resolveDir, args.path),
              },
            };
          },
        );
        build.onLoad(
          { filter: /#css-module$/, namespace: 'css-module' },
          async args => {
            const { pluginData } = args as {
              pluginData: { pathDir: string };
            };

            const source = await fsPromises.readFile(
              pluginData.pathDir,
              'utf8',
            );

            let cssModule: any = {};
            const result = await postcss([
              postcssModules({
                generateScopedName: function (name, filename) {
                  const newSelector = generateScopedName(name, filename);
                  cssModule[name] = newSelector;

                  return newSelector;
                },
                getJSON: () => {},
                scopeBehaviour: 'local',
              }),
            ]).process(source, { from: pluginData.pathDir });

            return {
              pluginData: { css: result.css },
              contents: `import "${
                pluginData.pathDir
              }"; export default ${JSON.stringify(cssModule)}`,
            };
          },
        );
        build.onResolve(
          { filter: /\.module\.css$/, namespace: 'css-module' },
          args => ({
            path: path.join(args.resolveDir, args.path, '#css-module-data'),
            namespace: 'css-module',
            pluginData: args.pluginData as { css: string },
          }),
        );
        build.onLoad(
          { filter: /#css-module-data$/, namespace: 'css-module' },
          args => ({
            contents: (args.pluginData as { css: string }).css,
            loader: 'css',
          }),
        );
      },
    },
  ],
  esbuildOptions(options) {
    options.banner = {
      js: `/* AdView Native Package - https://github.com/geniusrabbit/adview */`,
    };
    options.platform = 'browser';
    options.mainFields = ['browser', 'module', 'main'];
    options.packages = 'bundle';
  },
  env: dotenv.config().parsed,
});
