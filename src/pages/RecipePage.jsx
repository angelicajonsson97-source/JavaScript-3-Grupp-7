import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import useFetch from '../utils/useFetch'


RecipePage.route = {
<<<<<<< HEAD
  path: '/recipe/:slug' //add slug
=======
  path: '/recipe'
>>>>>>> 5adb672cdaf0d3f86791939bce33f46cbce208b2
}

export default function RecipePage() {

<<<<<<< HEAD
  const { slug } = useParams();

  //const slug = "classic-escargot-from-france";

  const { recipe, loading, error, update } = useFetch('/api/recipes/' + slug);

  
=======
  //const { slug } = useParams();

  const slug = "classic-escargot-from-france";

  const [recipe, setRecipe] = useFetch(slug);
>>>>>>> 5adb672cdaf0d3f86791939bce33f46cbce208b2
}