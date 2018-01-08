'use strict';
const path = require('path');
const Router = require('koa-joi-router');
const Joi = Router.Joi;
const tts = require('./tts');

module.exports = new Router()
.route({
  path: '/voices',
  method: 'get',
  validate: {
    query: Joi.object().keys({
      lang: Joi.string().regex(/^[a-z]{2}_[A-Z]{2}$/)
    }),
    output: {
      '200': {
        body: Joi.array().items({
          name: Joi.string().required().regex(/[a-z0-9\w]+/i),
          lang: Joi.string().required().regex(/^[a-z]{2}_[A-Z]{2}$/)
        })
      }
    }
  },
  handler: async (ctx) => {
    const lang = ctx.query.lang;
    const voices = await tts.getVoices();
    ctx.body = lang ? voices.filter(v => v.lang === lang) : voices;
  }
})
.route({
  path: '/speak',
  method: 'post',
  validate: {
    type: 'json',
    body: {
      text: Joi.string().required(),
      voice: Joi.string().regex(/[a-z0-9\w]+/i),
      format: Joi.string().length(3).alphanum()
    }
  },
  handler: async ctx => {
    const stream = await tts.speak(ctx.request.body);
    ctx.attachment(path.basename(stream.path));
    ctx.type = path.extname(stream.path);
    ctx.body = stream;
  }
});
