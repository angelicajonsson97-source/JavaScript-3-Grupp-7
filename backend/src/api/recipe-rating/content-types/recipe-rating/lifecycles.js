module.exports = {
  async afterCreate(event) {
    if (event.state?.skipAvg) return;
    const { result } = event;

    console.log("event:", event);

    const recipeId = result.recipeId;
    const rating = result.rating;

    console.log("event result", result);
    await strapi
      .service('api::recipe.recipe')
      .addRatingToAverage({
        recipeId,
        rating
      });
  },

  async afterDelete(event) {
    if (event.state?.skipAvg) return;
    const { result } = event;

    const recipeId = result.recipeId;
    const rating = result.rating;

    await strapi
      .service('api::recipe.recipe')
      .removeRatingFromAverage({
        recipeId,
        rating
      });
  }
};