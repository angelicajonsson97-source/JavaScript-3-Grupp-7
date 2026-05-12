'use strict';

/**
 * recipe-step service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::recipe-step.recipe-step');
