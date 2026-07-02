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
  },

  async adminStats(ctx) {
    try {
      // Hämta alla recept, kommentarer (med användarkoppling) och registrerade användare
      const recipes = await strapi.entityService.findMany('api::recipe.recipe');
      const comments = await strapi.entityService.findMany('api::comment.comment', {
        populate: { user: true }
      });
      const users = await strapi.entityService.findMany('plugin::users-permissions.user');

      // Aggregera användaraktivitet genom att räkna antalet kommentarer per användare
      const userActivity = users.map(userItem => {
        const userCommentsCount = comments.filter(c => c.user && c.user.id === userItem.id).length;
        return {
          id: userItem.id,
          username: userItem.username,
          commentsCount: userCommentsCount,
        };
      }).sort((a, b) => b.commentsCount - a.commentsCount); // Sortera så de mest aktiva hamnar först

      // Returnera sammanställd dashboard-statistik till frontend
      return {
        totalRecipes: recipes.length,
        totalComments: comments.length,
        totalUsers: users.length,
        mostActiveUsers: userActivity.slice(0, 3), // Hämta topp 3 mest aktiva användare
      };
    } catch (error) {
      ctx.throw(500, 'An error occurred while generating admin stats');
    }
  }
})
);
