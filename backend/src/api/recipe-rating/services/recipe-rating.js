'use strict';

/**
 * recipe-rating service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::recipe-rating.recipe-rating',
  
  
  ({ strapi }) => ({

    async recalculate(recipeId) {

      console.log("recalc- recipeId: ", recipeId);

      //get all ratings by recipe id
      const ratings = await strapi.db
        .query('api::recipe-rating.recipe-rating')
        .findMany({
          where: {
            recipe: recipeId,
          },
        });
      
      console.log("recalc - ratings: ", ratings);

      //get amount of ratings
      const count = ratings.length;

      //calculate the sum of all rating scores
      const sum = ratings.reduce(
        (acc, item) => acc + item.rating,
        0
      );

      //no division by 0, and det average rating
      const average = count > 0
        ? sum / count
        : 0;

      
      //update the recipe with new average rating and rating count
      await strapi.db
        .query('api::recipe.recipe')
        .update({
          where: {
            id: recipeId,
          },
          data: {
            average_rating: Number(average.toFixed(1)), //round to one decimal
            rating_count: count,
          },
        });

      console.log(
        `Recipe ${recipeId} updated. Avg: ${average}, Count: ${count}`
      );
    },

}));
