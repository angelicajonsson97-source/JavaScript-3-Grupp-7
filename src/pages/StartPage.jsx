import { useEffect, useState } from "react";
import Searchbar from "../components/searchbar";
import "../css/StartPage.css";

StartPage.route = {
  path: '/',
  label: 'Start',
  index: 1
};

export default function StartPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [featured, setFeatured] = useState([]);

  // Debounce the search query to avoid excessive API calls
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400); // Adjust the debounce delay as needed

    return () => clearTimeout(timeout);
  }, [query]);

  // API_call to fetch recipes based on the debounced query
  useEffect(() => {
    async function fetchRecipes() {
      if (debouncedQuery.trim() === "") {
        setRecipes([]);
        setNoResults(false);
        return;
      }

      setLoading(true);

      const q = encodeURIComponent(debouncedQuery);

      const res = await fetch(
        `/api/recipes?filters[$or][0][title][$containsi]=${q}` +
        `&filters[$or][1][description][$containsi]=${q}` +
        `&filters[$or][2][categories][category_name][$containsi]=${q}` +
        `&populate=*`
      );

      const data = await res.json();
      const items = data.data || [];

      setRecipes(items);
      setNoResults(items.length === 0 && debouncedQuery.length > 0);
      setLoading(false);

    }

    fetchRecipes();
  }, [debouncedQuery]);

  // API_call to fetch featured recipes
  useEffect(() => {
    async function fetchFeatured() {
      const res = await fetch(
        `/api/recipes?sort=likes_count:desc&pagination[limit]=3&populate=*`
      );

      const data = await res.json();
      setFeatured(data.data || []);

    }

    fetchFeatured();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <h1>Welcome to RecipeHub</h1>
        <h3>Discover and share your favorite recipes!</h3>
        <p>Explore our collection of delicious recipes from around the world.</p>


        <Searchbar
          value={query}
          onChange={setQuery}
          placeholder="Search for recipes, ingredients, or categories..."
          className="searchbar"
        />

        {loading && <p>Loading...</p>}
        {noResults && (
          <p>No recipes found for "{debouncedQuery}". Try a different search.</p>
        )}

        {/* Search results – visas bara när man söker */}
        {debouncedQuery && (
          <div className="recipe-list">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <h2>{recipe.title}</h2>
                <p>Cook time: {recipe.cook_time_minutes} min</p>
                <p>Difficulty: {recipe.difficulty}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured – recept */}
      <section className="featured-section">
        <h2>Featured Recipes</h2>

        <div className="featured-list">
          {featured.map((recipe) => (
            <div key={recipe.id} className="featured-card">
              
              <h3>{recipe.title}</h3>

              {recipe.image_url && (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="featured-image"
                />
              )}

              {recipe.difficulty && (
                <p className="difficulty">
                  Difficulty: {recipe.difficulty}
                </p>
              )}
              <div className="recipe-meta">
                <span>⏱ {recipe.cook_time_minutes} min</span>
                <span> • </span>
                <span>👍{recipe.recipe_reactions?.filter(r => r.reaction_type === "like").length}</span>
              </div>
            </div>
          ))}

        </div>
      </section>
    </>
  );
}