module.exports = {
  async afterCreate(event) {

    const recipeId = event.params.data.recipe;
    
    console.log("event:", event);
    console.log("params:", event.params);
    console.log("data:", event.params.data);
    console.log("recipeId:", recipeId);

  // IMPORTANT: fire-and-forget OR isolated call
    await strapi.service('api::recipe.recipe')
      .addRatingToAverage(recipeId);
  },

  async beforeDelete(event) {

    if (event.state?.skipAvg) return;
    const { result } = event;

    console.log("event:", event);

    console.log("result:", result);

    const recipeId = result.recipeId;
    const ratingValue = result.rating;

    await strapi
      .service('api::recipe.recipe')
      .removeRatingFromAverage({
        recipeId,
        rating: ratingValue
      });
  }
};