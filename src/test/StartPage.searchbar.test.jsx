import { render, screen } from "@testing-library/react";
import { vi, test, expect, beforeEach } from "vitest";
import StartPage from "../pages/StartPage";

// Mock the Link component from react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children }) => <div>{children}</div>,
}));

// Reset fetch before each test
beforeEach(() => {
  globalThis.fetch = vi.fn(() => 
    Promise.resolve({
      json: () => Promise.resolve({ data: [] }),
    })
  );
});

// Test that the search input is rendered
test("renders search input", () => {
  render(<StartPage />);
  const input = screen.getByPlaceholderText(
    "Search for recipes, ingredients, or categories..."
  );
  expect(input).toBeInTheDocument();
});
