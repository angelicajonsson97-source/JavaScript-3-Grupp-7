import { useState, useEffect } from 'react';

export default function useAverageRating(recipeId) { 

  const [averageRating, setAverageRating] = useState([]);
  const [loadingAV, setLoadingAV] = useState(true);
  const [errorAV, setErrorAV] = useState(null);


  const fetchAverageRating = async () => {

    if (!recipeId) return;

    setLoadingAV(true);
    setErrorAV(null);

    try {

      const res = await fetch(
        `/api/recipes?filters[id][$eq]=${recipeId}&fields[0]=average_rating`
      );

      if (!res.ok) {
        throw new Error(
          `Request failed: ${res.status}`
        );
      }

      const json = await res.json();

      setAverageRating(json?.data?.[0]);
    }
    catch (err) {
      setErrorAV(err);
    }
    finally {
      setLoadingAV(false);
    }
  }

  useEffect(() => {
    fetchAverageRating();
  }, [recipeId]);

  return {
    averageRating,
    loadingAV,
    errorAV,
    refetchAverageRating: fetchAverageRating,
    setAverageRating, //optimistic updates
  };
}