'use strict';

/**
 * helloworld router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::helloworld.helloworld');
