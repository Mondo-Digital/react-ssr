import path from 'path';
import render from './render';
import {
  getSsrConfig,
  getEngine,
  Config,
} from './helpers/core';

const escaperegexp = require('lodash.escaperegexp');

let moduleDetectRegEx: RegExp;

const register = async (app: any): Promise<void> => {
  const renderFile = async (file: string, options: any, cb: (err: any, html?: any) => void) => {
    if (!moduleDetectRegEx) {
      const pattern = [].concat(options.settings.views).map(viewPath => '^' + escaperegexp(viewPath)).join('|');
      moduleDetectRegEx = new RegExp(pattern);
    }

    const { settings, cache, _locals, ...props } = options;
    try {
      return cb(undefined, await render(file, props));
    } catch (e) {
      return cb(e);
    } finally {
      if (process.env.NODE_ENV !== 'production') {
        Object.keys(require.cache).forEach((filename) => {
          if (moduleDetectRegEx.test(filename)) {
            delete require.cache[filename];
          }
        });
      }
    }
  };

  const config: Config = getSsrConfig();
  const engine: 'jsx' | 'tsx' = getEngine();
  app.engine(engine, renderFile);
  app.set('views', path.join(process.cwd(), config.viewsDir));
  app.set('view engine', engine);

  if (process.env.NODE_ENV === 'production') {
    await (await import('./optimize/production')).default(app);
  } else {
    await (await import('./optimize/development')).default(app);
  }
};

export default register;
