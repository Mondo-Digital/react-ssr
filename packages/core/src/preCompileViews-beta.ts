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

const { PromisePool } = require('@supercharge/promise-pool')
const ufs = require('unionfs').ufs;
const memfs = new MemoryFileSystem();
ufs.use(fs).use(memfs);

const _compileEachEntry = async (entry: webpack.Entry) => {
  const splitConfigs = Object.keys(entry).map((key) => {
    return configureWebpack({ [key]: entry[key] });
  })
  // webpack(splitConfigs, (err, { stats }) => { console.log('finished', err) });

  // Object.keys(entry).map(async (key) => {
  // const key = Object.keys(entry)[0]
  // for (const key of Object.keys(entry)) {
  console.log('Start compiling...')
  await PromisePool
    .withConcurrency(ssrConfig.betaOpts.preCompilePromisePool)
    .for(Object.keys(entry))
    .onTaskStarted((_item, stats) => {
      console.log(`Progress: ${stats.processedPercentage()}%`)
      console.log(`Finished: ${stats.processedCount()} tasks.`)
    })
    .process(async (key) => {
      const webpackConfig: webpack.Configuration = configureWebpack({ [key]: entry[key] });
      const compiler: webpack.Compiler = webpack(webpackConfig)
      compiler.inputFileSystem = ufs;

      return new Promise((resolve, reject) => {
        compiler.run((err: Error, stats: webpack.Stats) => {
          err && reject(err.stack || err);
          stats.hasErrors() && reject(stats.toString());

          resolve();
        });
      });
    })
  // }
  // })
}

export default async (): Promise<void> => {
  fse.removeSync(path.join(cwd, ssrConfig.distDir));

  const [entry, entryPages] = await getEntry(memfs);
  _compileEachEntry(entry)
  // console.log('entry', entry)
  // const webpackConfig: webpack.Configuration = configureWebpack(entry);
  // const compiler: webpack.Compiler = webpack(webpackConfig);
  // compiler.inputFileSystem = ufs;
  //
  // await new Promise((resolve, reject) => {
  //   console.log('start compiling')
  //   compiler.run((err: Error, stats: webpack.Stats) => {
  //     err && reject(err.stack || err);
  //     stats.hasErrors() && reject(stats.toString());
  //
  //     for (let i = 0; i < entryPages.length; i++) {
  //       const page = entryPages[i];
  //       const pageId = getPageId(page, '_');
  //       console.log(page)
  //     }
  //
  //     console.log(`Done. ${entryPages.length} pages build into ${ssrConfig.distDir}`)
  //     resolve();
  //   });
  // });
};
