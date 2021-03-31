import fs from 'fs';
import fse from 'fs-extra';
import MemoryFileSystem from 'memory-fs';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import { configureWebpack } from './optimize/webpack.config';
import { getEntry } from './optimize/helpers';
import {
  existsSync,
  ssrConfig,
  getPageId,
} from './helpers';

const cwd = process.cwd();

const ufs = require('unionfs').ufs;
const memfs = new MemoryFileSystem();
ufs.use(fs).use(memfs);

export default async (): Promise<void> => {
  fse.removeSync(path.join(cwd, ssrConfig.distDir));

  const [entry, entryPages] = await getEntry(memfs);
  const webpackConfig: webpack.Configuration = configureWebpack(entry);
  const compiler: webpack.Compiler = webpack(webpackConfig);
  compiler.inputFileSystem = ufs;

  await new Promise((resolve, reject) => {
    compiler.run((err: Error, stats: webpack.Stats) => {
      err && reject(err.stack || err);
      stats.hasErrors() && reject(stats.toString());

      for (let i = 0; i < entryPages.length; i++) {
        const page = entryPages[i];
        const pageId = getPageId(page, '_');
        console.log(page)
      }

      console.log(`Done. ${entryPages.length} pages build into ${ssrConfig.distDir}`)
      resolve();
    });
  });
};
