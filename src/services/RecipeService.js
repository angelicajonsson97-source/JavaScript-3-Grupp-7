const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

const post = async (path, body, isFormData = false) => {
  const res = await fetch(`${API_BASE_URL}/api/${path}`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? body : JSON.stringify({ data: body }),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error?.message || `Failed to POST /${path}`);
  return json.data;
};

/* ── Fetches ── */

export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  const json = await res.json();
  return json.data ?? [];
};

export const fetchIngredients = async () => {
  const res = await fetch(`${API_BASE_URL}/api/ingredients`);
  const json = await res.json();
  return json.data ?? [];
};

/* ── Create ── */

// Creates a category with the given name and generating a random slug
export const createCategory = async (name) => {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return post("categories", { category_name: name, slug });
};

export const createIngredient = async (name) => {
  return post("ingredients", { ingredient_name: name });
};

// Creates a recipe-ingredient relation and connecting an ingredient to a recipe with quantity and unit
export const createRecipeIngredient = async ({
  ingredientId,
  quantity,
  unit,
}) => {
  return post("recipe-ingredients", {
    quantity: quantity ? Number(quantity) : null,
    unit,
    ingredient: { connect: [{ documentId: ingredientId }] },
  });
};

// Uploads an image file and returns the Strapi media library ID
export const uploadImage = async (file) => {
  const form = new FormData();
  form.append("files", file);
  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Failed to upload image");
  // Strapi returns an array, we want the first file's ID
  return json[0].id;
};

// Creates a recipe step and uploading an image if there is one and returns the created step
export const createRecipeStep = async (step) => {
  const data = {
    step_number: step.step_number ? Number(step.step_number) : null,
    instruction: step.instruction,
  };
  if (step.image) {
    data.image_url = await uploadImage(step.image);
  }
  return post("recipe-steps", data);
};

// Creates a recipe with the given payload and optional image file and generating a random slug
export const createRecipe = async (payload, imageFile) => {
  if (imageFile) {
    payload.image_url = await uploadImage(imageFile);
  }
  // Append a random suffix to guarantee uniqueness
  payload.slug = `${payload.slug}-${Math.random().toString(36).slice(2, 7)}`;
  return post("recipes", payload);
};
