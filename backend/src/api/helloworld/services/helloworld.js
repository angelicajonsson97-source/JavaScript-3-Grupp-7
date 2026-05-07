'use strict';

/**
 * helloworld service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::helloworld.helloworld');
