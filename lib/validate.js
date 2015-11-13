'use strict';

const validatorIt = require('validator-it');

module.exports = function (schemas) {
  const validatorFactory = validatorIt(schemas);
  return (ctx, next) => {
    try {
      validatorFactory.call(ctx, ctx.request, true);
    } catch (e) {
      ctx.throw(e.status || e.statusCode || 400, e.message);
    }
    return next();
  };
};
