import { useState, useEffect } from 'react';

export default function useComments(recipeId) { 

  const [comments, setComments] = useState([]);
  const [loadingCO, setLoadingCO] = useState(true);
  const [errorCO, setErrorCo] = useState(null);


  const fetchComments = async () => {

    if (!recipeId) return;

    setLoadingCO(true);
    setErrorCo(null);

    try {

      const res = await fetch(
        `/api/comments?filters[recipe][$eq]=${recipeId}`
        + `&sort=likes_count:desc`
        + `&populate=user`
        + `&populate=recipe_rating`
      );

      if (!res.ok) {
        throw new Error(
          `Request failed: ${res.status}`
        );
      }
    
      const json = await res.json();

      console.log("API comments: ", json);
      setComments(json?.data);
      setLoadingCO(false);
    }
    catch (err) {
      setErrorCo(err);
    }
    finally { 
      setLoadingCO(false);
    }
  }
  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  return {
    comments,
    loadingCO,
    errorCO,
    refetchComments: fetchComments,
    setComments, //optimistic updates
  };
}