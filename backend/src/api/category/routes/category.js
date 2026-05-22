"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

// Keep all default CRUD routes and add the custom /top route
module.exports = {
  routes: [
    {
      method: "GET",
      path: "/categories/top",
      handler: "api::category.category.top",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/categories",
      handler: "api::category.category.find",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/categories/:id",
      handler: "api::category.category.findOne",
      config: { auth: false },
    },
    {
      method: "POST",
      path: "/categories",
      handler: "api::category.category.create",
    },
    {
      method: "PUT",
      path: "/categories/:id",
      handler: "api::category.category.update",
    },
    {
      method: "DELETE",
      path: "/categories/:id",
      handler: "api::category.category.delete",
    },
  ],
};
