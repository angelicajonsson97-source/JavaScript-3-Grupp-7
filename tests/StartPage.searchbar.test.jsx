import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import StartPage from "../src/pages/StartPage";

// Mock the Link component from react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children }) => <div>{children}</div>,
}));

// Mock fetch to prevent actual API calls during tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: [] }),
  })
);

// Test that the search input is rendered
test("renders search input", () => {
  render(<StartPage />);
  const input = screen.getByPlaceholderText(
    "Search for recipes, ingredients, or categories..."
  );
  expect(input).toBeInTheDocument();
});
