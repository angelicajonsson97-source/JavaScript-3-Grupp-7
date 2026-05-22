import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/CreateRecipe.module.css";
import useFetch from "../utils/useFetch";
import {
  createIngredient,
  createRecipeStep,
  createRecipeIngredient,
  createRecipe,
} from "../services/RecipeService";
import {
  emptyStep,
  emptyIngredient,
  generateSlug,
} from "../utils/recipeHelper";
import CreateCategory from "../components/CategoryCard";
import CreateRecipeSteps from "../partials/CreateRecipeSteps";
import CreateRecipeIngredients from "../partials/CreateRecipeIngredients";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";
const CATEGORIES_URL = `${API_BASE_URL}/api/categories?fields[0]=category_name&fields[1]=documentId`;
const INGREDIENTS_URL = `${API_BASE_URL}/api/ingredients?fields[0]=ingredient_name&fields[1]=documentId`;

const CreateRecipe = () => {
  const navigate = useNavigate();

  const { data: fetchedData, loading: optionsLoading } = useFetch(
    CATEGORIES_URL,
    INGREDIENTS_URL,
  );

  const [newCategories, setNewCategories] = useState([]);
  const [newIngredients, setNewIngredients] = useState([]);

  const categories = [...(fetchedData[0]?.data ?? []), ...newCategories];
  const availableIngredients = [
    ...(fetchedData[1]?.data ?? []),
    ...newIngredients,
  ];

  const [form, setForm] = useState({
    title: "",
    description: "",
    cook_time_minutes: "",
    servings: "",
    difficulty: "easy",
    image: null,
    category_id: "",
  });

  const [steps, setSteps] = useState([emptyStep()]);
  const [ingredients, setIngredients] = useState([emptyIngredient()]);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /* ── Form ── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ── Steps ── */

  const updateStep = (index, field, value) =>
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );

  const addStep = () =>
    setSteps((prev) => [
      ...prev,
      { ...emptyStep(), step_number: prev.length + 1 },
    ]);

  const removeStep = (index) =>
    setSteps((prev) => prev.filter((_, i) => i !== index));

  /* ── Ingredients ── */

  const updateIngredient = (index, field, value) =>
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
    );

  const setIngredientMode = (index, mode) =>
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? {
              ...ing,
              mode,
              ingredient_id: "",
              newName: "",
              confirmed: false,
              confirmError: "",
            }
          : ing,
      ),
    );

  const confirmNewIngredient = async (index) => {
    const name = ingredients[index].newName.trim();
    if (!name) return;
    try {
      const newIng = await createIngredient(name);
      setNewIngredients((prev) => [...prev, newIng]);
      setIngredients((prev) =>
        prev.map((row, i) =>
          i === index
            ? {
                ...row,
                ingredient_id: newIng.documentId,
                confirmed: true,
                confirmError: "",
              }
            : row,
        ),
      );
    } catch (err) {
      updateIngredient(index, "confirmError", err.message);
    }
  };

  const addIngredient = () =>
    setIngredients((prev) => [...prev, emptyIngredient()]);
  const removeIngredient = (index) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index));

  /* ── Submit ── */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSaving(true);

    try {
      setSubmitStatus("Saving steps…");
      const stepIds = [];
      for (const step of steps) {
        if (!step.instruction.trim()) continue;
        const created = await createRecipeStep(step);
        stepIds.push(created.documentId);
      }

      setSubmitStatus("Saving ingredients…");
      const recipeIngredientIds = [];
      for (const ing of ingredients) {
        let ingredientId = ing.ingredient_id;
        if (ing.mode === "create" && !ing.confirmed) {
          const name = ing.newName.trim();
          if (!name) continue;
          const newIng = await createIngredient(name);
          ingredientId = newIng.documentId;
        }
        if (!ingredientId) continue;
        const created = await createRecipeIngredient({
          ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
        });
        recipeIngredientIds.push(created.documentId);
      }

      setSubmitStatus("Publishing recipe…");

      await createRecipe(
        {
          title: form.title,
          slug: generateSlug(form.title),
          description: form.description,
          cook_time_minutes: form.cook_time_minutes
            ? Number(form.cook_time_minutes)
            : null,
          servings: form.servings ? Number(form.servings) : null,
          difficulty: form.difficulty,
          ...(form.category_id && {
            categories: { connect: [{ documentId: form.category_id }] },
          }),
          ...(stepIds.length && {
            recipe_steps: {
              connect: stepIds.map((documentId) => ({ documentId })),
            },
          }),
          ...(recipeIngredientIds.length && {
            recipe_ingredients: {
              connect: recipeIngredientIds.map((documentId) => ({
                documentId,
              })),
            },
          }),
        },
        form.image,
      );

      setSubmitStatus("Recipe published!");
      setIsSaving(false);
      navigate("/");
    } catch (err) {
      setSubmitStatus("");
      setSubmitError(err.message || "Something went wrong");
      setIsSaving(false);
    }
  };

  /* ── Render ── */

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Recipe Form</p>
          <h1 className={styles.title}>Create a New Recipe</h1>
        </div>

        <div className={styles.body}>
          {optionsLoading && (
            <p className={styles.hint}>Loading categories and ingredients…</p>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.sectionLabel}>Basics</p>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="title">
                Title <span className={styles.required}>*</span>
              </label>
              <input
                id="title"
                className={styles.input}
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Grandma's Lasagne"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="description">
                Description <span className={styles.required}>*</span>
              </label>
              <textarea
                id="description"
                className={styles.textarea}
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                required
                placeholder="What makes this recipe special?"
              />
            </div>

            <p className={styles.sectionLabel}>Details</p>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cook_time_minutes">
                  Cook time (min)
                </label>
                <input
                  id="cook_time_minutes"
                  className={styles.input}
                  type="number"
                  name="cook_time_minutes"
                  value={form.cook_time_minutes}
                  onChange={handleChange}
                  placeholder="45"
                  min="0"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="servings">
                  Servings
                </label>
                <input
                  id="servings"
                  className={styles.input}
                  type="number"
                  name="servings"
                  value={form.servings}
                  onChange={handleChange}
                  placeholder="4"
                  min="1"
                />
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Difficulty</span>
              <div className={styles.difficultyGroup}>
                {["easy", "medium", "hard"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`${styles.difficultyBtn} ${form.difficulty === level ? styles.active : ""}`}
                    onClick={() =>
                      setForm((p) => ({ ...p, difficulty: level }))
                    }
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <CreateCategory
              categories={categories}
              selectedId={form.category_id}
              onSelect={(id) => setForm((p) => ({ ...p, category_id: id }))}
              onCategoryCreated={(newCat) =>
                setNewCategories((prev) => [...prev, newCat])
              }
            />

            <p className={styles.sectionLabel}>Photo</p>

            <div className={styles.field}>
              <label className={styles.label}>Recipe image</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      image: e.target.files?.[0] ?? null,
                    }))
                  }
                />
                <span className={styles.fileUploadIcon}>🍽</span>
                <p className={styles.fileUploadText}>
                  {form.image ? "" : "Click or drag an image here"}
                </p>
                {form.image && (
                  <p className={styles.fileUploadName}>📎 {form.image.name}</p>
                )}
              </div>
            </div>

            <CreateRecipeSteps
              steps={steps}
              onUpdate={updateStep}
              onAdd={addStep}
              onRemove={removeStep}
            />

            <CreateRecipeIngredients
              ingredients={ingredients}
              availableIngredients={availableIngredients}
              onUpdate={updateIngredient}
              onAdd={addIngredient}
              onRemove={removeIngredient}
              onSetMode={setIngredientMode}
              onConfirmNew={confirmNewIngredient}
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSaving}
            >
              {isSaving ? submitStatus : "Publish Recipe"}
            </button>
          </form>

          {submitStatus === "Recipe published!" && (
            <p className={`${styles.status} ${styles.statusSuccess}`}>
              ✓ {submitStatus}
            </p>
          )}
          {submitError && (
            <p className={`${styles.status} ${styles.statusError}`}>
              ✕ {submitError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRecipe;

CreateRecipe.route = {
  path: "/create",
  label: "Create Recipe",
  index: true,
};
