module.exports = {

  async afterCreate(event) { 

    const { result } = event;

    await strapi
    .service('api::recipe.recipe')
    .addRatingToAverage({
        recipeId: result.recipe.id,
        rating: result.rating
    });
  },

  async afterDelete(event) {

    const { result } = event;
    
    await strapi
      .service('api::recipe.recipe')
      .removeRatingFromAverage({
        recipeId: result.recipe.id,
        rating: result.rating
      });
  }
}