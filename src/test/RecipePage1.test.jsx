import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import RecipePage1 from '../pages/RecipePage1';

describe('RecipePage', () => { 

    //nullify fetches
  vi.mock('../utils/useRecipe', () => ({
    default: () => ({ 
      data: [{
        data: [{
          id: 1,
          title: "Test recipe",
          recipe_ingredients: [],
          recipe_steps: [],
          }]
        }],
      loading: false,
      error: null,
    })
  }))
  vi.mock('../utils/useComments', () => ({
    default: () => ({ 
      comments: [],
      loadingCO: false,
      errorCO: null,
      refetchComments: vi.fn(),
      setComments: vi.fn(),
    })
  }))
  vi.mock('../utils/useRatings', () => ({
    default: () => ({ 
      ratings: [],
      loadingRA: false,
      errorRA: null,
      refetchRatings: vi.fn(),
      setRatings: vi.fn(),
    })
  }))
  vi.mock('../utils/useAverageRating', () => ({
    default: () => ({ 
      comments: [],
      loadingAV: false,
      errorAV: null,
      refetchAverageRating: vi.fn(),
      setAverageRating: vi.fn(),
    })
  }))


  it('shows ingredients, instructions and comment titles', () => { 
    render(<RecipePage1 />);
    expect(screen.getByText("Ingredients")).toBeInTheDocument();
    expect(screen.getByText("Instructions")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
  } )
})