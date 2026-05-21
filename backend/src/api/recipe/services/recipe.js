'use strict';

/**
 * recipe service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService(
  'api::recipe.recipe',
  
  ({ strapi }) => ({ 

    async addRatingToAverage({ recipeId, rating }) {

      const recipe = await strapi.entityService.findOne(
        'api::recipe.recipe',
        recipeId
      );

      const newRatingCount = recipe.rating_count + 1;
      
      const newAverageRating = ((recipe.average_rating * recipe.rating_count) + rating) / newRatingCount; 

      await strapi.entityService.update(
        'api::recipe.recipe',
        recipeId,
        {
          data: {
            average_rating: Number(newAverageRating.toFixed(2)),
            rating_count: newRatingCount
          }
        }
      )
    }
  })
  
  {


});
