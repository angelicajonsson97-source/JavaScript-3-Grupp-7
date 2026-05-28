import { useState, useEffect } from 'react';

export default function useRatings(recipeId) { 

  const [ratings, setRatings] = useState([]);
  const [loadingRE, setLoadingRE] = useState(true);
  const [errorRE, setErrorRE] = useState(null);


  const fetchRatings = async () => {

    if (!recipeId) return;

    setLoadingRE(true);
    setErrorRE(null);

    try {

      const res = await fetch(
        `/api/recipe-ratings?filters[recipe][id][$eq]=${recipeId}`
        + `&populate=user`,
      );

      if (!res.ok) {
        throw new Error(
          `Request failed: ${res.status}`
        );
      }

      const json = await res.json();

      setRatings(json?.data);
    }
    catch (err) { 
    setErrorRE(err);
    }
    finally {
      setLoadingRE(false);
    }
  }
  

  useEffect(() => {
    fetchRatings();
  }, [recipeId]);

  return {
    ratings,
    loadingRE,
    errorRE,
    refetchRatings: fetchRatings,
    setRatings, //optimistic updates
  };
}