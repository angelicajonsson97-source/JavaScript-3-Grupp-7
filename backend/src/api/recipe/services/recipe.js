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

      if (!recipe) {
        strapi.log.error(`Recipe not found: ${recipeId}`);
        return;
      }

      console.log("recipe in service:", recipe);

      const newCount = recipe.rating_count + 1;

      const newAverage =
        (
          (recipe.average_rating * recipe.rating_count)
          + rating
        )
        /
        newCount;
      
      console.log("made it here");

      await strapi.entityService.update(
        'api::recipe.recipe',
        recipeId,
        {
          data: {
            average_rating: Number(newAverage.toFixed(1)),
            rating_count: newCount
          },
          state: {skipAvg: true}
        }
      );
    },

    async removeRatingFromAverage({ recipeId, rating }) {

      const recipe = await strapi.entityService.findOne(
        'api::recipe.recipe',
        recipeId
      );

      if (!recipe) {
        strapi.log.error(`Recipe not found: ${recipeId}`);
        return;
      }

      const newCount = recipe.rating_count - 1;

      const newAverage =
        newCount > 0
          ?
          (
            (recipe.average_rating * recipe.rating_count)
            - rating
          )
          /
          newCount
          : 0;

      await strapi.entityService.update(
        'api::recipe.recipe',
        recipeId,
        {
          data: {
            average_rating: Number(newAverage.toFixed(1)),
            rating_count: newCount
          },
          state: {skipAvg: true}
        }
      );
    }
  })
);
