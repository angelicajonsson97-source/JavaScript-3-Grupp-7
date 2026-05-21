'use strict';

/**
 * recipe service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService(
  'api::recipe.recipe',
  
  ({ strapi }) => ({ 

    async addRatingToAverage({ recipeId, rating }) {

      console.log("recipeId in service: ", recipeId);

      const recipe = await strapi.db.query('api::recipe.recipe').findOne({
        where: { documentId: recipeId }
      });

      console.log("recipe in service: ", recipe);
      const newRatingCount = recipe.rating_count + 1;
      
      const newAverageRating = ((recipe.average_rating * recipe.rating_count) + rating) / newRatingCount; 

      await strapi.db.query('api::recipe.recipe').update({
        where: { documentId: recipeId },
        data: {
          average_rating: Number(newAverageRating.toFixed(1)),
          rating_count: newRatingCount
        }
      });
    },

    async removeRatingFromAverage({ recipeId, rating }) {

      console.log("recipeId in service: ", recipeId);
      const recipe = await strapi.db.query('api::recipe.recipe').findOne({
        where: { documentId: recipeId }
      });

      console.log("pre rating count: ", recipe.rating_count);

      const newRatingCount = recipe.rating_count - 1;

      console.log("past rating count: ", newRatingCount);

      const newAverageRating = newRatingCount > 0 ?
        ((recipe.average_rating * recipe.rating_count) - rating) / newRatingCount
        : 0;
      
      await strapi.db.query('api::recipe.recipe').update({
        where: { documentId: recipeId },
        data: {
          average_rating: Number(newAverageRating.toFixed(1)),
            rating_count: newRatingCount
          }
        }
      )
    }
  })
);
