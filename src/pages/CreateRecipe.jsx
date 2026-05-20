import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/CreateRecipe.module.css";
import useFetch from "../utils/useFetch";
import {
  fetchCategories,
  fetchIngredients,
  createCategory,
  createIngredient,
  createRecipeStep,
  createRecipeIngredient,
  createRecipe,
} from "../services/RecipeService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

const emptyStep = () => ({ step_number: "", instruction: "", image: null });

const emptyIngredient = () => ({
  mode: "select",
  ingredient_id: "",
  newName: "",
  confirmed: false,
  confirmError: "",
  quantity: "",
  unit: "",
});

const CreateRecipe = () => {
  const navigate = useNavigate();

  const { data: fetchedData, loading: optionsLoading } = useFetch(
    `${API_BASE_URL}/api/categories`,
    `${API_BASE_URL}/api/ingredients`,
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

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categoryCreating, setCategoryCreating] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [submitStatus, setSubmitStatus] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files?.[0] ?? null }));
  };

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
      const newIngredient = await createIngredient(name);
      setNewIngredients((prev) => [...prev, newIngredient]);
      setIngredients((prev) =>
        prev.map((row, i) =>
          i === index
            ? {
                ...row,
                ingredient_id: String(newIngredient.id),
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

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategoryCreating(true);
    setCategoryError("");
    try {
      const newCat = await createCategory(name);
      setNewCategories((prev) => [...prev, newCat]);
      setForm((prev) => ({ ...prev, category_id: String(newCat.id) }));
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch (err) {
      setCategoryError(err.message);
    } finally {
      setCategoryCreating(false);
    }
  };

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
        stepIds.push(created.id);
      }

      setSubmitStatus("Saving ingredients…");
      const recipeIngredientIds = [];
      for (const ing of ingredients) {
        let ingredientId = ing.ingredient_id;

        if (ing.mode === "create" && !ing.confirmed) {
          const name = ing.newName.trim();
          if (!name) continue;
          const newIngredient = await createIngredient(name);
          ingredientId = String(newIngredient.id);
        }

        if (!ingredientId) continue;
        const created = await createRecipeIngredient({
          ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
        });
        recipeIngredientIds.push(created.id);
      }

      setSubmitStatus("Publishing recipe…");
      const slugValue = form.title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      await createRecipe(
        {
          title: form.title,
          slug: slugValue,
          description: form.description,
          cook_time_minutes: form.cook_time_minutes
            ? Number(form.cook_time_minutes)
            : null,
          servings: form.servings ? Number(form.servings) : null,
          difficulty: form.difficulty,
          ...(form.category_id && {
            category: { connect: [{ id: Number(form.category_id) }] },
          }),
          ...(stepIds.length && {
            recipe_steps: { connect: stepIds.map((id) => ({ id })) },
          }),
          ...(recipeIngredientIds.length && {
            recipe_ingredients: {
              connect: recipeIngredientIds.map((id) => ({ id })),
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

  const ingredientLabel = (item) =>
    item.attributes?.ingredient_name ?? item.ingredient_name ?? "";

  const categoryLabel = (cat) =>
    cat.attributes?.category_name ?? cat.category_name ?? "";

  {
    optionsLoading && (
      <p className={styles.hint}>Loading categories and ingredients…</p>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Recipe Form</p>
          <h1 className={styles.title}>Create a New Recipe</h1>
        </div>

        <div className={styles.body}>
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

            <div className={styles.field}>
              <label className={styles.label} htmlFor="category_id">
                Category
              </label>
              <div className={styles.inlineRow}>
                <div className={`${styles.selectWrapper} ${styles.grow}`}>
                  <select
                    id="category_id"
                    name="category_id"
                    className={styles.select}
                    value={form.category_id}
                    onChange={handleChange}
                  >
                    <option value="">— Select a category —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {categoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={`${styles.inlineToggleBtn} ${showNewCategory ? styles.active : ""}`}
                  onClick={() => {
                    setShowNewCategory((v) => !v);
                    setCategoryError("");
                  }}
                >
                  {showNewCategory ? "✕ Cancel" : "+ New"}
                </button>
              </div>

              {showNewCategory && (
                <div className={styles.inlineCreateBox}>
                  <p className={styles.inlineCreateLabel}>New category name</p>
                  <div className={styles.inlineRow}>
                    <input
                      className={`${styles.input} ${styles.grow}`}
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Pasta"
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleCreateCategory())
                      }
                    />
                    <button
                      type="button"
                      className={styles.confirmBtn}
                      onClick={handleCreateCategory}
                      disabled={categoryCreating || !newCategoryName.trim()}
                    >
                      {categoryCreating ? "…" : "Create"}
                    </button>
                  </div>
                  {categoryError && (
                    <p className={styles.inlineError}>{categoryError}</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Photo ── */}
            <p className={styles.sectionLabel}>Photo</p>

            <div className={styles.field}>
              <label className={styles.label}>Recipe image</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
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

            <p className={styles.sectionLabel}>Recipe Steps</p>

            {steps.map((step, index) => (
              <div key={index} className={styles.dynamicCard}>
                <div className={styles.dynamicCardHeader}>
                  <span className={styles.dynamicCardTitle}>
                    Step {index + 1}
                  </span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeStep(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Step number</label>
                    <input
                      className={styles.input}
                      type="number"
                      min="1"
                      value={step.step_number}
                      placeholder={index + 1}
                      onChange={(e) =>
                        updateStep(index, "step_number", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Step image</label>
                    <div className={styles.fileUploadSmall}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateStep(
                            index,
                            "image",
                            e.target.files?.[0] ?? null,
                          )
                        }
                      />
                      <span>
                        {step.image
                          ? `📎 ${step.image.name}`
                          : "Optional image"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Instruction <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={step.instruction}
                    placeholder="Describe what to do in this step…"
                    onChange={(e) =>
                      updateStep(index, "instruction", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <button type="button" className={styles.addBtn} onClick={addStep}>
              + Add step
            </button>

            <p className={styles.sectionLabel}>Ingredients</p>

            {ingredients.map((ing, index) => (
              <div key={index} className={styles.dynamicCard}>
                <div className={styles.dynamicCardHeader}>
                  <span className={styles.dynamicCardTitle}>
                    Ingredient {index + 1}
                  </span>
                  <div className={styles.dynamicCardActions}>
                    <div className={styles.modeToggle}>
                      <button
                        type="button"
                        className={`${styles.modeBtn} ${ing.mode === "select" ? styles.active : ""}`}
                        onClick={() => setIngredientMode(index, "select")}
                      >
                        Existing
                      </button>
                      <button
                        type="button"
                        className={`${styles.modeBtn} ${ing.mode === "create" ? styles.active : ""}`}
                        onClick={() => setIngredientMode(index, "create")}
                      >
                        + New
                      </button>
                    </div>
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeIngredient(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.fieldRow3}>
                  <div className={styles.field}>
                    <label className={styles.label}>Ingredient</label>

                    {ing.mode === "select" ? (
                      <div className={styles.selectWrapper}>
                        <select
                          className={styles.select}
                          value={ing.ingredient_id}
                          onChange={(e) =>
                            updateIngredient(
                              index,
                              "ingredient_id",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">— Select —</option>
                          {availableIngredients.map((item) => (
                            <option key={item.id} value={item.id}>
                              {ingredientLabel(item)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        {ing.confirmed ? (
                          <div className={styles.confirmedPill}>
                            ✓ {ing.newName}
                            <button
                              type="button"
                              className={styles.pillEdit}
                              onClick={() =>
                                updateIngredient(index, "confirmed", false)
                              }
                            >
                              edit
                            </button>
                          </div>
                        ) : (
                          <div className={styles.inlineRow}>
                            <input
                              className={`${styles.input} ${styles.grow}`}
                              type="text"
                              value={ing.newName}
                              onChange={(e) =>
                                updateIngredient(
                                  index,
                                  "newName",
                                  e.target.value,
                                )
                              }
                              placeholder="Ingredient name…"
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(),
                                confirmNewIngredient(index))
                              }
                            />
                            <button
                              type="button"
                              className={styles.confirmBtn}
                              onClick={() => confirmNewIngredient(index)}
                              disabled={!ing.newName.trim()}
                            >
                              Add
                            </button>
                          </div>
                        )}
                        {ing.confirmError && (
                          <p className={styles.inlineError}>
                            {ing.confirmError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Quantity</label>
                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      step="0.01"
                      value={ing.quantity}
                      placeholder="2"
                      onChange={(e) =>
                        updateIngredient(index, "quantity", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Unit</label>
                    <input
                      className={styles.input}
                      type="text"
                      value={ing.unit}
                      placeholder="cups, g, tsp…"
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className={styles.addBtn}
              onClick={addIngredient}
            >
              + Add ingredient
            </button>

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
