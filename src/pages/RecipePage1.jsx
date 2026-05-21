import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import useFetch from '../utils/useFetch'


RecipePage.route = {
  path: '/recipe/:slug' //add slug
}

export default function RecipePage() {

  const { slug } = useParams();

  const [displayRecipeData, setDisplayRecipeData] = useState(null);

  const [userRating, setUserRating] = useState(0);
  //const slug = "classic-escargot-from-france";

  //fetch data
  const { data, loading, error, refetch } = useFetch(
    `/api/recipes?filters[slug][$eq]=${slug}`
    + `&populate[user][populate]=*`
    + `&populate[categories][populate]`
    + `&populate[comments][sort][0]=likes_count:desc` //sorts by likes using strapi
    + `&populate[comments][populate]=*`
    + `&populate[recipe_reactions][populate]`
    + `&populate[recipe_steps][sort][0]=step_number:asc` //sorts by step using strapi
    + `&populate[recipe_ratings][populate]`
    + `&populate[recipe_ingredients][populate]=ingredient`
  );
  console.log("raw recipe data: ", data);
  
  //select the useful data from the raw data
  const processedRecipeData = data?.[0]?.data?.[0]
  console.log("processed data: ", processedRecipeData);

  //set processed data to state for rendering
  useEffect(() => { 
    if (processedRecipeData) { 
      setDisplayRecipeData(processedRecipeData)
    }
  }, [processedRecipeData])

  if (loading) return <p>Loading...</p>;
  if (error) return <p> Error loading recipe</p>
  if (!displayRecipeData) return <p>No recipe found</p>

  //update user rating

  console.log("Id: ",displayRecipeData.documentId);
  async function sendRating(ratingValue) {
    try { 
      await fetch("/api/recipe-ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: {
            rating: ratingValue,
            recipe: displayRecipeData.documentId,
            recipeId: displayRecipeData.id,
            }
        })
      })

      await refetch();
    }
    catch (err) {
      console.error(err)
    }
  }


  //deconstruct data from use state
  const {
    title,
    average_rating,
    categories,
    cook_time_minutes,
    difficulty,
    likes_count,
    description,
    recipe_reactions,
    recipe_ingredients,
    recipe_steps,
    comments
  } = displayRecipeData;


  //counts the number of bookmarks in recipe_reactions
  const bookmarkCount = recipe_reactions?.filter(
    (item) => item.reaction_type === "book-mark"
  ).length || 0;

  //sorts the recipe steps by number
  //const instructions = recipe_steps?.sort(
  // (a, b) => a.step_number - b.step_number) || [];
  
  const instructions = recipe_steps || [];
  
  return (
    <>
      <h1>{title}</h1>

      <p>Rating: {average_rating}</p>
      <p>Cooktime: {cook_time_minutes}</p>
      <p>Categories: {categories?.map((c) => c.category_name).join(', ')}</p>
      <p>Difficulty: {difficulty}</p>
      <p>Likes: {likes_count}</p>
      <p>Bookmarks: {bookmarkCount}</p>

      <p>{description}</p>

      {/* renders user comment and rating */}
      
      <form onSubmit={(e) => {
        e.preventDefault();
        sendRating(userRating);
      }}>
        <label>
          <input
            type="text"
            value={userRating}
            min="0"
            max="5"
            onChange={(e) => setUserRating(Number(e.target.value))} />
        </label>
        <button type="submit">Submit Rating</button>
      </form>

      {/* renders ingredients */}
      <h2>Ingredients</h2>
      <ul>
        {recipe_ingredients?.map((i) => (
          <li
          key={i.documentId}>
          {i?.ingredient?.ingredient_name} {i?.quantity} {i?.unit}
          </li>
        ))}
      </ul>

      {/* renders steps */}
      <h2>Instructions</h2>
      <ul>
        {instructions.map((i) => (
          <li
          key={i.documentId}>
            {i.step_number}. {i.instruction}
          </li>
        ))}
      </ul>

      {/* renders comments */}
      <h2>Comments</h2>
      <ul>
        {comments?.map((c) => (
          <li
          key={c?.documentId}>
            {"Rating: " + c?.recipe_rating.rating} {<br/>}
            {c?.user.username} {<br />}
            {c?.comment_text} {<br />}
            Likes: {c?.likes_count}
            {<br />} {<br />}
          </li>
        ))}
      </ul>
    </>
  )

}