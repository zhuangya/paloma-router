'use strict';

const debug = require('debug')('paloma-router');
const pathToRegexp = require('path-to-regexp');
const validator = require('./validate');
const compose = require('koa-compose');
const cons = require('consolidate');

module.exports = function (route) {
  const method = route.method.toUpperCase();
  const path = route.path;
  const re = pathToRegexp(path);
  const engine = route.engine || 'ejs';
  const template = route.template;
  const validate = route.validate;

  let controller = Array.isArray(route.controller) ? route.controller : [route.controller];

  controller = controller.map((controllerName) => {
    if ('string' === typeof controllerName) {
      return this.controller(controllerName);
    }
    if ('function' === typeof controllerName) {
      return controllerName;
    }
    throw new Error('`controller` only support function or name of controller.');
  });

  if (validate) {
    controller.unshift(validator(validate));
  }
  controller = compose(controller);

  return (ctx, next) => {
    ctx.params = {};
    if (!matches(ctx, method)) return next();

    const m = re.exec(ctx.path);
    if (m) {
      const args = m.slice(1).map(decode);
      re.keys.forEach((pathRe, index) => {
        ctx.params[pathRe.name] = args[index];
      });
      debug('%s %s matches %s %j', ctx.method, path, ctx.path, args);

      if (!template) {
        return controller(ctx, next);
      }
      return Promise.resolve()
        .then(controller(ctx, next))
        .then(() => {
          ctx.filename = template;
          ctx.cache = true;
          return cons[engine].render(ctx.app.view(route.template), ctx);
        })
        .then((html) => {
          ctx.type = 'html';
          ctx.body = html;
        });
    }

    // miss
    return next();
  };
};

/**
 * Decode value.
 */

function decode(val) {
  if (val) return decodeURIComponent(val);
}

/**
 * Check request method.
 */

function matches(ctx, method) {
  if (!method) return true;
  if (ctx.method === method) return true;
  if (method === 'GET' && ctx.method === 'HEAD') return true;
  return false;
}
