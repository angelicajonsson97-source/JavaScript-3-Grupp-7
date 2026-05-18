import { useEffect, useState } from "react";
import Searchbar from "../components/searchbar";

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
      setLoading(true);
      
      const res = await fetch(`/api/recipes?filters[$or][0][title][$containsi]=${debouncedQuery}
         &filters[$or][1][description][$containsi]=${debouncedQuery}
         &filters[$or][2][categories][category_name][$containsi]=${debouncedQuery}
         &filters[$or][3][recipe_ingredients][ingredient][ingredient_name][$containsi]=${debouncedQuery}
         &filters[$or][4][tags][tag_name][$containsi]=${debouncedQuery}
         &populate=*`);
      
      const data = await res.json();
      const items = data.data || [];

      setRecipes(items);
      setNoResults(items.length === 0 && debouncedQuery.length > 0);
      setLoading(false);
    }

    fetchRecipes();
  }, [debouncedQuery]);

  return (
    <section className="start-page">
      <h1>Welcome to RecipeHub</h1>
      <p>Discover and share your favorite recipes!</p>
      <Searchbar
        value={query}
        onchange={setQuery}
        placeholder="Search for recipes, ingredients, or categories..."
      />
      {loading && <p>Loading...</p>}
      {noResults && <p>No recipes found for "{debouncedQuery}". Try a different search?</p>}
      
      <div className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <h2>{recipe.attributes.title}</h2>
            <p>{recipe.attributes.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}