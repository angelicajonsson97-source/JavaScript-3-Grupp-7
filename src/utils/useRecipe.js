import { useState, useEffect } from 'react';

export default function useRecipe(slug) {

  const [data, setData] = useState(null);
  const [loadingRE, setLoadingRE] = useState(true);
  const [errorRE, setErrorRE] = useState(null);

  useEffect(() => {

    if (!slug) return;
    
    setErrorRE(null);
    
    async function fetchRecipe() {
        
      try {

        setLoadingRE(true);

        const res = await fetch(
          `/api/recipes?filters[slug][$eq]=${slug}`
          + `&populate[recipe_steps][sort][0]=step_number:asc` //sorts by step using strapi
          + `&populate[recipe_ingredients][populate]=ingredient`
          + `&populate[categories][populate]=*`
        );

        if (!res.ok) {
          throw new Error(
            `Request failed: ${res.status}`
          );
        }

        const json = await res.json();

        console.log("useRecipe:", json);
        setData(json?.data?.[0]);
      }
      catch (err) {
        setErrorRE(err);
      }
      finally {
        setLoadingRE(false);
      }
    }

    fetchRecipe();
    
    }, [slug]);

  return { data, loadingRE, errorRE };
}