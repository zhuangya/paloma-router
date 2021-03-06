## paloma-router

router for paloma.

### Example

```
'use strict';

const Paloma = require('paloma');
const app = new Paloma();

app.controller('indexCtrl', function (ctx, next, indexService) {
  ctx.body = indexService.getName();
});

app.controller('404Ctrl', function (ctx, next) {
  ctx.body = 'Sorry';
});

app.service('indexService', function () {
  this.getName = function () {
    return 'paloma';
  };
});

app.view('404View', '<h1><%= body %>, <code><%= url %></code> Not Found</h1>');

app.route({
  method: 'GET',
  path: '/',
  controller: 'indexCtrl'
});

app.route({
  method: 'GET',
  path: '/(.+)',
  controller: '404Ctrl',
  template: '404View'
});

app.listen(3000);
```

More examples see [paloma-example](https://github.com/palomajs/paloma-examples).

### Notes

`paloma-router` not support load partials view yet, like EJS's `include`.
