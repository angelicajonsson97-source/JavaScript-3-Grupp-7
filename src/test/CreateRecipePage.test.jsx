import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";
import CreateRecipe from "../pages/CreateRecipe";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, username: "testuser" } }),
}));

vi.mock("../utils/useFetch", () => ({
  default: () => ({ data: [], loading: false, error: null }),
}));

vi.mock("../services/RecipeService", () => ({
  createCategory: vi.fn(),
  createIngredient: vi.fn(),
  createRecipeStep: vi.fn(),
  createRecipeIngredient: vi.fn(),
  createRecipe: vi.fn(),
}));

vi.mock("../utils/recipeFormHelpers", () => ({
  emptyStep: () => ({ step_number: "", instruction: "", image: null }),
  emptyIngredient: () => ({
    mode: "select",
    ingredient_id: "",
    newName: "",
    confirmed: false,
    confirmError: "",
    quantity: "",
    unit: "",
  }),
  generateSlug: (title) => title.toLowerCase().replace(/\s+/g, "-"),
}));

const renderForm = () =>
  render(
    <MemoryRouter>
      <CreateRecipe />
    </MemoryRouter>,
  );

describe("Publish Recipe button", () => {
  it("shows the publish button", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: /publish recipe/i }),
    ).toBeInTheDocument();
  });

  it("button is clickable", async () => {
    renderForm();
    const button = screen.getByRole("button", { name: /publish recipe/i });
    await userEvent.click(button);
    expect(button).toBeInTheDocument();
  });
});
