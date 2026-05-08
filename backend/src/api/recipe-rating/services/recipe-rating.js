'use strict';

/**
 * recipe-rating service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::recipe-rating.recipe-rating');
