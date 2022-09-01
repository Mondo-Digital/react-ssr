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

export default async (app: express.Application): Promise<void> => {
  fse.removeSync(path.join(cwd, ssrConfig.distDir));

  const [entry, entryPages] = await getEntry(memfs);
  const webpackConfig: webpack.Configuration = configureWebpack(entry);
  const compiler: webpack.Compiler = webpack(webpackConfig);
  compiler.inputFileSystem = ufs;

  await new Promise<void>((resolve, reject) => {
    compiler.run((err, stats) => {
      err && reject(err.stack || err);
      stats?.hasErrors() && reject(stats.toString());

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

      resolve();
    });
  });
};
