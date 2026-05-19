import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import useFetch from '../utils/useFetch'


RecipePage.route = {
  path: '/recipe/:slug' //add slug
}

export default function RecipePage() {

  const { slug } = useParams();

  //const slug = "classic-escargot-from-france";

  const { recipeData, loading, error } = useFetch(
    `/api/recipes?filters[slug][$eq]=${slug}&populate=*`);
  
  const recipe = recipeData?.[0]?.data?.[0];

  console.log(recipe);

  if (loading) return <p>Loading...</p>;
  if (error) return <p> Error loading recipe</p>

  if (!recipe) return <p>No recipe found</p>
  
  return (
    <>
      <h1>{recipe.attributes.title}</h1>
    </>
  )

}