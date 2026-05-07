'use strict';

/**
 * helloworld controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::helloworld.helloworld');
