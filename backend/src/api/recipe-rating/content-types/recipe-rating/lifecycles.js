'use strict';

module.exports = {

  async afterCreate(event) {
    
    console.log("afterCreate event: ", event.params.data.recipe.connect?.[0].id
      || event.params.data.recipe.set?.[0].id);

    console.log("event", event.params.data.recipe.set?.[0].id ||
      event.params.data.recipe.connect?.[0].id);

    //id can come from both frontend and strapi interface 
    // set = frontend
    // connect = strapi
    const recipeId = event.params.data.recipe.set?.[0].id ||
      event.params.data.recipe.connect?.[0].id;

    console.log("afterCreate, recipe ID: ", recipeId);

    await strapi
      .service('api::recipe-rating.recipe-rating')
      .recalculate(recipeId);
  },

  async afterUpdate(event) {


    const recipeId = event.params.data.recipe.set?.[0].id ||
      event.params.data.recipe.connect?.[0].id;
    
    await strapi
      .service('api::recipe-rating.recipe-rating')
      .recalculate(recipeId);
  },
    
  async beforeDelete(event) {
  
    console.log("event: ", event);

    //get id of recipe_rating to be deleted
    const id = event.params.where.id;

    const rating = await strapi.db
      .query('api::recipe-rating.recipe-rating')
      .findOne({
        where: { id },
        populate: ['recipe'],
      });
    
    console.log("before rating: ", rating)

    //save the recipe id in state so afterDelete can access it
    event.state = {
      recipeId: rating?.recipe?.id,
    };
  },

  async afterDelete(event) {
  
    console.log("afterDelete event: ", event);
    console.log("afterDelete event state: ", event.state);

    const recipeId = event.state?.recipeId;

    if (!recipeId) return;

    await strapi
    .service('api::recipe-rating.recipe-rating')
    .recalculate(recipeId);
  }
};