import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import useFetch from '../utils/useFetch'


RecipePage.route = {
  path: '/recipe/:slug' //add slug
}

export default function RecipePage() {

  const { slug } = useParams();

  //const slug = "classic-escargot-from-france";

  const { recipe, loading, error, update } = useFetch('/api/recipes/' + slug);

  
}