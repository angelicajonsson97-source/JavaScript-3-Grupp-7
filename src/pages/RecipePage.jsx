import { useState, useEffect } from 'react'
import { useParams } from 'react-react-dom'

import useFetch from '../utils/useFetch'


RecipePage.route = {
  path: '/recipe/:slug'
}

export default function RecipePage() {

  const { slug } = useParams();

  const [recipe, setRecipe] = useFetch(slug);
}