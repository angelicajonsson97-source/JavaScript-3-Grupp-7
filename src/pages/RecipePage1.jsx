import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import useFetch from '../utils/useFetch'

import "../css/RecipePage.css";


RecipePage.route = {
  path: '/recipe/:slug'
}

export default function RecipePage() {

  //const slug = "classic-escargot-from-france";
  const { slug } = useParams();

  const { user, loading: authLoading } = useAuth();
  console.log("user:", user);

  //flags
  const [flagDeleteRating, setFlagDeleteRating] = useState(false);
  const [flagShowComment, setFlagShowComment] = useState(false);
  const [flagDeleteComment, setFlagDeleteComment] = useState(false);


  const [userRating, setUserRating] = useState({
    rating: 0,
    documentId: null
  });

  const [userComment, setUserComment] = useState({
    text: "",
    documentId: null
  });

  const [likes, setLikes] = useState(0);
  const [bookmarks, setBookmarks] = useState(0);


  //fetch data
  const { data, loading, error, refetch } = useFetch(
    `/api/recipes?filters[slug][$eq]=${slug}`
    + `&populate[user][populate]=*`
    + `&populate[categories][populate]`
    + `&populate[comments][sort][0]=likes_count:desc` //sorts by likes using strapi
    + `&populate[comments][populate]=*`
    + `&populate[recipe_reactions][populate]`
    + `&populate[recipe_steps][sort][0]=step_number:asc` //sorts by step using strapi
    + `&populate[recipe_ratings][populate]=user`
    + `&populate[recipe_ingredients][populate]=ingredient`
  );
  
  //select the useful data from the raw data
  const displayRecipeData = data?.[0]?.data?.[0]
  console.log("processed data: ", displayRecipeData);

  //deconstruct data
  const {
    title,
    average_rating,
    categories,
    cook_time_minutes,
    difficulty,
    likes_count,
    description,
    recipe_reactions,
    recipe_ingredients,
    recipe_steps,
    recipe_ratings,
    comments
  } = displayRecipeData || {};

  useEffect(() => {
    if (!recipe_ratings || !user) return;

    const existingRating = recipe_ratings.find(
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
  }, [recipe_ratings, user]);

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
  }, [comments, user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p> Error loading recipe</p>
  if (!displayRecipeData) return <p>No recipe found</p>

  //post or update user rating
  async function sendRating() {
    try { 
      if (userRating.documentId) {
        await fetch("/api/recipe-ratings", {
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
        const res = await fetch("/api/recipe-ratings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              rating: userRating.rating,
              recipe: displayRecipeData.id,
              user : user.id,
            }
          })
        });
        const data = await res.json();
        console.log("error: ", data);
      }

      setFlagDeleteRating(true);
      setFlagShowComment(true);
      await refetch();
    }
    catch (err) {
      console.error(err)
    }
  }

  //delete user rating
  async function deleteRating() {
    try { 
      await fetch(`/api/recipe-ratings/${userRating.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
      })

      setFlagDeleteRating(false);
      setFlagShowComment(false);
      setUserRating({rating: 0});
      await refetch();
    }
    catch (err) {
      console.error(err)
    }
  }

  //post or update a user comment
  async function sendComment() {
    try { 
      if (userComment.id) {
        await fetch("/api/comments", {
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
              recipe: displayRecipeData.id,
              likes_count: 0,
              user: user.id,
              recipe_rating: userRating.documentId
            }
          })
        });
      }

      setFlagDeleteComment(true);
      await refetch();
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
      setUserComment({text: ""});
      await refetch();
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

      <p>Rating: {average_rating}</p>
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
                  type="button"> Delete Rating </button>
              ) : (<p> Rate the recipe...</p>)}
          </form>

          {flagShowComment ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              sendComment();
            }}>
              <label>
                <input
                  type="text"
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
      <ul>
        {comments?.map((c) => (
          <li
            key={c?.documentId}>
            {"Rating: " + (c?.recipe_rating?.rating ?? 0)} {<br/>}
            {c?.user.username} {<br />}
            {c?.comment_text} {<br />}
            Likes: {c?.likes_count}
            {<br />}
          </li>
        ))}
      </ul>
    </>
  )
}