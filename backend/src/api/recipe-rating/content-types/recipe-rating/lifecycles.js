module.exports = {

  async afterCreate(event) { 

    const { result } = event;

    console.log("result: ", result);
    console.log("event: ", event);

    console.log("recipe:", event.params.data.recipe.set[0].id );

    const recipeId = event.params.data.recipe.set[0].id;

    console.log("recipeId: ", recipeId);
    await strapi
    .service('api::recipe.recipe')
    .addRatingToAverage({
        recipeId,
        rating: result.rating
    });
  },

  async afterDelete(event) {

    const { result } = event;

    console.log("recipe:", event.params.data.recipe.set[0].id );

    const recipeId = event.params.data.recipe.set[0].id;    
    await strapi
      .service('api::recipe.recipe')
      .removeRatingFromAverage({
        recipeId,
        rating: result.rating
      });
  }
}