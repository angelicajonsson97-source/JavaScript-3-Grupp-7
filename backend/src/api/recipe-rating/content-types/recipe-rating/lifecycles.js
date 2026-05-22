module.exports = {
  async afterCreate(event) { 
    const { result } = event;
    await strapi
    .service('api::recipe.recipe')
    .updateRecipeAverage(result.recipe.id);
  },

  async afterDelete(event) { 
    const { result } = event;
    
    await strapi
    .service('api::recipe.recipe')
    .updateRecipeAverage(result.recipe.id);
  
  },

  async afterUpdate(event) {
    const { result } = event;
    await strapi
    .service('api::recipe.recipe')
    .updateRecipeAverage(result.recipe.id);
  }
}