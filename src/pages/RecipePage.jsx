import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import useFetch from '../utils/useFetch'


RecipePage.route = {
  path: '/recipe/:slug' //add slug
}

export default function RecipePage() {

  const { slug } = useParams();

  //const slug = "classic-escargot-from-france";

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
  
  console.log("raw recipe data:" + data);
  
  const recipe = data?.[0]?.data?.[0]
 
  console.log(recipe);

  if (loading) return <p>Loading...</p>;
  if (error) return <p> Error loading recipe</p>

  if (!recipe) return <p>No recipe found</p>

  const {
    title,
    average_rating,
    cook_time_minutes,
    difficulty,
    likes_count,
    description,
    ingredients,
  } = recipe;
  
  return (
    <>
      <h1>{title}</h1>

      <p>Rating: {average_rating}</p>
      <p>Cooktime: {cook_time_minutes}</p>
      <p>Difficulty: {difficulty}</p>
      <p>Likes: {likes_count}</p>
      <p>{description}</p>

      <h2>Ingredients</h2>
      <ul>
        {ingredients.map(ingredient => <li
          key={ingredient.documentId}>
          {ingredient} { }
          
        </li>)}
      </ul>

    </>
  )

}