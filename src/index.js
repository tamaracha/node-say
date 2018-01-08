'use strict';
const Koa = require('koa');
const router = require('./routes');

new Koa()
.use(router.middleware())
.listen(3000);
