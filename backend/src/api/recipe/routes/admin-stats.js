// Amir Hemmatnia — Custom route för att exponera aggregerad admin-statistik till dashboarden
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/recipes/admin-stats',
      handler: 'recipe.adminStats', // Mappar mot metoden i controller-filen
    },
  ],
};
