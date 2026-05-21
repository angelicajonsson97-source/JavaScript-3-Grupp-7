export const emptyStep = () => ({
  step_number: "",
  instruction: "",
  image: null,
});

export const emptyIngredient = () => ({
  mode: "select",
  ingredient_id: "",
  newName: "",
  confirmed: false,
  confirmError: "",
  quantity: "",
  unit: "",
});

export const generateSlug = (title) =>
  title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
