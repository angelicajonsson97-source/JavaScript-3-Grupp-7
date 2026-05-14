import { useState, useEffect, useCallback } from 'react';

//can take many urls
export default function useFetch(...urls) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //useCallback memorizes and resues the function between renders
  // instead of creating a new one every time.
  //also only recreate update when urls change
  const update = useCallback(async () => {

    setError(null);
    setLoading(true);

    try {
      setLoading(true);
      
      const responses = await Promise.all(
        urls.map(async (url) => {
          const res = await fetch(url);

          if (!res.ok) {
            throw new Error(
              `Request failed: ${res.status}`
            );
          }

          return res.json();
        })
      );

      setData(responses);
    } catch (err) {
      setError(err);
    }
    finally {
      setLoading(false);
    }
  }, [urls.join("|")]);

  useEffect(() => {
    update();
  }, [update]);


  //data currently returns an array with with objects of each url
  // each object has data and meta, as this doesn't use Object.assign()
  // to get the data, do ex. 'const recipes = data[0].data' for first url
  return {
    data,
    loading,
    error,
    refetch: update,
  }
}