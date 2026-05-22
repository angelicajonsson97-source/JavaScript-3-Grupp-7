'use strict';

/**
 * recipe-rating controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::recipe-rating.recipe-rating', ({ strapi }) => ({
  
  async create(ctx) {
    console.log("CONTROLLER CREATE HIT:", Date.now());

    const response = await super.create(ctx);

    return response;
  },

}));
