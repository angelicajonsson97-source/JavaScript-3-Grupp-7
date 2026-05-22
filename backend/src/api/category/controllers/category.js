"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async top(ctx) {
      try {
        const recipes = await strapi.documents("api::recipe.recipe").findMany({
          populate: { categories: { fields: ["documentId", "category_name"] } },
        });

        const countMap = {};
        for (const recipe of recipes) {
          const recipeCategories = recipe.categories;
          if (!recipeCategories?.length) continue;

          for (const category of recipeCategories) {
            const key = category.documentId;
            if (!countMap[key]) {
              countMap[key] = {
                id: key,
                category_name: category.category_name ?? "Unknown",
                recipeCount: 0,
              };
            }
            countMap[key].recipeCount++;
          }
        }

        const top3 = Object.values(countMap)
          .sort((a, b) => b.recipeCount - a.recipeCount)
          .slice(0, 3);

        ctx.body = { data: top3 };
      } catch (err) {
        console.error("Top categories error:", err.message);
        ctx.throw(500, err);
      }
    },
  }),
);
