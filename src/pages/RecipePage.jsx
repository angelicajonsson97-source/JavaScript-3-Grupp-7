import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import useFetch from '../utils/useFetch'


RecipePage.route = {
  path: '/recipe/:slug' //add slug
}

export default function RecipePage() {

  const { slug } = useParams();

  const [displayRecipeData, setDisplayRecipeData] = useState(null);

  //const slug = "classic-escargot-from-france";

  //fetch data
  const { data, loading, error } = useFetch(
    `/api/recipes?filters[slug][$eq]=${slug}`
    + `&populate[user][populate]=*`
    + `&populate[categories][populate]`
    + `&populate[comments][populate]=*`
    + `&populate[recipe_reactions][populate]`
    + `&populate[recipe_steps][populate]`
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
  const instructions = recipe_steps?.sort(
    (a, b) => a.step_number - b.step_number) || [];
  
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