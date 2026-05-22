'use strict';

/**
 * recipe service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService(
  'api::recipe.recipe',
  
  ({ strapi }) => ({ 

    async addRatingToAverage(recipeDocumentId) {

      const ratings = await strapi.db.query('api::recipe-rating.recipe-rating').findMany({
        where: { recipeDocumentId }
      });

      const count = ratings.length;
      const avg =
        count === 0
          ? 0
          : ratings.reduce((s, r) => s + r.rating, 0) / count;

      await strapi.db.query('api::recipe.recipe').update({
        where: { documentId: recipeDocumentId },
        data: {
          rating_count: count,
          average_rating: Number(avg.toFixed(1)),
        },
      });
    },

    async removeRatingFromAverage({ recipeId, rating }) {

      console.log("made it to delte")

      const recipe = await strapi.db.query('api::recipe.recipe').findOne({
        where: { documentId: recipeId }
      });

      console.log("recipe in delete:", recipe);

      if (!recipe) {
        strapi.log.error('Recipe not found');
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
        recipe.id,
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
