import fs from 'fs';
import fse from 'fs-extra';
import MemoryFileSystem from 'memory-fs';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import { configureWebpack } from './webpack.config';
import { getEntry } from './helpers';
import {
  existsSync,
  ssrConfig,
  getPageId,
} from '../helpers';

const cwd = process.cwd();

const ufs = require('unionfs').ufs;
const memfs = new MemoryFileSystem();
ufs.use(fs).use(memfs);

const _registerExpressRoutes = (app: express.Application, entryPages: string[]) => {
  for (let i = 0; i < entryPages.length; i++) {
    const page = entryPages[i];
    const pageId = getPageId(page, '_');

    app.use(`/_react-ssr/${pageId}.css`, (req, res) => {
      const filename = path.join(cwd, ssrConfig.distDir, `${pageId}.css`);
      const style = existsSync(filename) ? fs.readFileSync(filename).toString() : '';
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(style, 'utf-8');
    });

    app.use(`/_react-ssr/${pageId}.js`, (req, res) => {
      const filename = path.join(cwd, ssrConfig.distDir, `${pageId}.js`);
      const script = fs.readFileSync(filename).toString();
      res.status(200).type('.js').send(script);
    });
  }
}

export default async (app: express.Application): Promise<void> => {
  const [entry, entryPages] = await getEntry(memfs);

  if (ssrConfig.usePreCompiled && !existsSync(path.join(cwd, ssrConfig.distDir))) {
    throw new Error("Build dir not found and `usePreCompiled` is set to `true`.")
  } else if (ssrConfig.usePreCompiled && existsSync(path.join(cwd, ssrConfig.distDir))) {
    _registerExpressRoutes(app, entryPages)
  } else if (!ssrConfig.usePreCompiled){
    fse.removeSync(path.join(cwd, ssrConfig.distDir));

    const webpackConfig: webpack.Configuration = configureWebpack(entry);
    const compiler: webpack.Compiler = webpack(webpackConfig);
    compiler.inputFileSystem = ufs;

    await new Promise((resolve, reject) => {
      compiler.run((err: Error, stats: webpack.Stats) => {
        err && reject(err.stack || err);
        stats.hasErrors() && reject(stats.toString());

        _registerExpressRoutes(app, entryPages)

        resolve();
      });
    });
  } 
};
