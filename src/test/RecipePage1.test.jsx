import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import RecipePage1 from '../pages/RecipePage1';

describe('RecipePage', () => { 

  //nullify useFetch
  vi.mock('../utils/useFetch', () => ({
    default: () => ({ 
      data: [
        {
          data: [
            {
              recipe_ingredients: [],
              recipe_steps: [],
              commments: [],
            }
          ]
        }
      ],
      loading: false,
      error: null,
    })
  }))

  it('shows ingredients, instructions and comment titles', () => { 
    render(<RecipePage1 />);
    expect(screen.getByText("Ingredients")).toBeInTheDocument();
    expect(screen.getByText("Instructions")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
  } )
})