import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import useFetch from '../utils/useFetch'

//hooks
import useRecipe from '../utils/useRecipe'
import useComments from '../utils/useComments'
import useRatings from '../utils/useRatings'
import useAverageRating from '../utils/useAverageRating'

import "../css/RecipePage.css";


RecipePage.route = {
  path: '/recipe/:slug'
}

export default function RecipePage() {

  //const slug = "classic-escargot-from-france";
  const { slug } = useParams();

  const auth = useAuth() || {};
  const { user, loading: authLoading } = auth;
  console.log("user:", user);

  //flags
  const [flagDeleteRating, setFlagDeleteRating] = useState(false);
  const [flagShowComment, setFlagShowComment] = useState(false);
  const [flagDeleteComment, setFlagDeleteComment] = useState(false);


  //data for recipe
  const {
    data: recipe,
    errorRE,
    loadingRE } = useRecipe(slug);

  console.log("data:", recipe)
  
  const recipeId = recipe?.id;

  //data for averageRating
  const {
    averageRating,
    loadingAV,
    errorAV,
    refetchAverageRating,
    setAverageRating
  } = useAverageRating(recipeId);

  console.log("average rating: ", averageRating);

  //data for comment section
  const {
    comments,
    loadingCO,
    errorCO,
    refetchComments,
    setComments
  } = useComments(recipeId);

  console.log("comments: ", comments);

  //data for comment section rating
  const {
    ratings,
    loadingRA,
    errorRA,
    refetchRatings,
    setRatings
  } = useRatings(recipeId);

  console.log("ratings: ", ratings);

  const [userRating, setUserRating] = useState({
    rating: 0,
    documentId: null
  });

  const [userComment, setUserComment] = useState({
    text: "",
    documentId: null
  });

  //currently useless
  const [likes, setLikes] = useState(0);
  const [bookmarks, setBookmarks] = useState(0);


  //deconstruct static recipe data
  const {
    title,
    categories,
    cook_time_minutes,
    difficulty,
    likes_count,
    description,
    recipe_reactions,
    recipe_ingredients,
    recipe_steps,
  } = recipe || {};

  //find if auth user has a rating already. 
  useEffect(() => {
    if (!ratings || !user) return;

    const existingRating = ratings.find(
      (r) => r.user?.id === user.id
    );

    if (existingRating) {

      setFlagDeleteRating(true);
      setFlagShowComment(true);

      setUserRating({
        rating: existingRating.rating,
        documentId: existingRating.documentId,
      });
    }
  }, [ratings, user]);

  //find if auth user has a comment already
  useEffect(() => {
    if (!comments || !user) return;

    const existingComment = comments.find(
      (c) => c.user?.id === user.id
    );

    if (existingComment) {

      setFlagDeleteComment(true);

      setUserComment({
        text: existingComment.comment_text,
        documentId: existingComment.documentId,
      });
    }
  }, [comments,user]);

  if (loadingRE) return <p>Loading recipe...</p>
  if (errorRE || errorAV || errorCO || errorRA ) return <p> Error loading recipe</p>
  if (!recipe) return <p>No recipe found</p>

  //post or update user rating
  async function sendRating() {
    try { 

      let res;

      console.log("userRating id:", userRating.documentId)

      if (userRating.documentId) {
        res = await fetch(`/api/recipe-ratings/${userRating.documentId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            data: {
              rating: userRating.rating
            }
          })
        });
      }
      else { 
        res = await fetch("/api/recipe-ratings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              rating: userRating.rating,
              recipe: recipe.id,
              user : user.id,
            }
          })
        });
      }
      const json = await res.json();

      setUserRating({
        rating: json?.data.rating ?? userRating.rating,
        documentId: json?.data?.documentId ?? userRating.documentId
      })

      setFlagDeleteRating(true);
      setFlagShowComment(true);

      await refetchAverageRating();
      await refetchRatings();
      await refetchComments();

    }
    catch (err) {
      console.error(err)
    }
  }

  //delete user rating
  async function deleteRating() {
    try { 
      await fetch(`/api/recipe-ratings/${userRating.documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
      })

      setFlagDeleteRating(false);
      setFlagShowComment(false);
      await refetchAverageRating();
      await refetchRatings();
      setUserRating({
        rating: 0,
        documentId: null
       });
      
      //setRatings(prev => prev.filter(r => r.documentId !== userRating.documentId));
    }
    catch (err) {
      console.error(err)
    }
  }

  //post or update a user comment
  async function sendComment() {
    try { 

      if (userComment.documentId) {
        await fetch(`/api/comments/${userComment.documentId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            data: {
              comment_text: userComment.text,
            }
          })
        });

      }
      else {
        await fetch("/api/comments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            data: {
              comment_text: userComment.text,
              recipe: recipe.id,
              likes_count: 0,
              user: user.id,
              recipe_rating: userRating.documentId
            }
          })
        });

      }

      setComments(prev => [
        ...prev,
        {
          comment_text: userComment.text,
          user,
          recipe_rating: { rating: userRating.rating },
        }
      ]);
      await refetchComments();

      setFlagDeleteComment(true);
    }
    catch (err) {
      console.error(err)
    }
  }

  //delete user comment
  async function deleteComment() {
    try { 
      await fetch(`/api/comments/${userComment.documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      })

      setFlagDeleteComment(false);

      await refetchComments();
      
      setUserComment({
        text: "",
        documentId: null
      });
      
      //setComments(prev => prev.filter(c => c.docmentId !== userComment.docmentId));
    }
    catch (err) {
      console.error(err)
    }
  }
  
  const bookmarkCalc = recipe_reactions?.filter(
    (item) => item.reaction_type === "book-mark"
  ).length || 0
  //setBookmarks(bookmarkCalc);

  const instructions = recipe_steps || [];

  return (
    <>
      <h1>{title}</h1>

      <p>Rating: {
        loadingAV ?
          "..."
          :
          averageRating?.average_rating}
      </p>
      <p>Cooktime: {cook_time_minutes}</p>
      <p>Categories: {categories?.map((c) => c.category_name).join(', ')}</p>
      <p>Difficulty: {difficulty}</p>

      <p>Likes: {likes}
        <button onClick={(e) => setLikes(likes + 1)}>Like</button> { }
      </p>

      <p>Bookmarks: {bookmarks}
        <button onClick={(e) => setBookmarks(bookmarks + 1)}>Bookmark</button> { }
      </p>

      <p>{description}</p>

      {/* renders user comment and rating */}
      
      {user ?(
        <>
          <form onSubmit={(e) => {
            e.preventDefault();
            sendRating();
          }}>
            <label>
            <input
              type="text"
              value={userRating.rating}
              min="0"
              max="5"
              onChange={(e) => {
                setUserRating({
                  ...userRating,
                  rating: Number(e.target.value)
                })}}
              />
            </label>
            <button type="submit">Submit Rating</button>
            {flagDeleteRating ? (
                <button
                onClick={deleteRating}
                type="button"
                disabled={!!userComment.documentId}
              > Delete Rating </button>
              ) : (<p> Rate the recipe...</p>)}
          </form>

          {flagShowComment ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              sendComment();
            }}>
              <label>
                <input
                  required type="text"
                  value={userComment.text}
                  onChange={(e) => setUserComment({
                    ...userComment,
                    text: e.target.value
                  })}
                  placeholder="Add a comment"
                />
              </label>
              <button type="submit">Submit Comment</button>
              {flagDeleteComment ? (
                <button
                  onClick={deleteComment}
                  type="button"> Delete Comment </button>
              ) : (<p> Post a comment...</p>)}
            </form>
          ) : (<p>You must rate the recipe before commenting.</p>)
          }
        </>) : (<p>Log in or create an account to comment and rate the recipe.</p>)
      }

      {/* renders ingredients */}
      <h2>Ingredients</h2>
      <ul>
        {recipe_ingredients?.map((i) => (
          <li
          key={i.documentId}>
          {i?.ingredient?.ingredient_name} {i?.quantity} {i?.unit}
          </li>
        ))}
      </ul>

      {/* renders steps */}
      <h2>Instructions</h2>
      <ul>
        {instructions.map((i) => (
          <li
          key={i.documentId}>
            {i.step_number}. {i.instruction}
          </li>
        ))}
      </ul>

      {/* renders comments */}
      <h2>Comments</h2>
      {loadingCO && loadingRA ? (
        <p>Loding comments...</p>
      ) : (
        <ul>
          {comments?.map((c) => (
            <li
              key={c?.documentId}>
              {"Rating: " + (c?.recipe_rating?.rating ?? 0)} {<br />}
              {c?.user.username} {<br />}
              {c?.comment_text} {<br />}
              Likes: {c?.likes_count}
              {<br />}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
