'use strict';

/**
 * comment-reaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::comment-reaction.comment-reaction');
