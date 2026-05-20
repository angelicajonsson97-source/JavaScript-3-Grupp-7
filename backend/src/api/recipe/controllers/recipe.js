'use strict';

const { pop } = require('../../../../config/middlewares');

/**
 * recipe controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::recipe.recipe', ({ strapi }) => ({  
  async mostLiked(ctx) {
    try {
      // Fetch all recipes with their reactions
      const recipes = await strapi.entityService.findMany('api::recipe.recipe', {
        populate: {
          recipe_reactions: true,
        },
      });
      // Map recipes to include the count of likes
      const sorted = recipes
        .map(recipe => ({
          ...recipe,
          likes: recipe.recipe_reactions.filter(
            reaction => reaction.reaction_type === 'like').length,
        }))
        .sort((a, b) => b.likes - a.likes); // Sort by likes 
      return sorted;
    } catch (error) {
      ctx.throw(500, 'An error occurred while fetching the most liked recipes');
    }
  }
})
);
