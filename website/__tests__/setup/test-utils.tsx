import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Custom render function that wraps with providers if needed
export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

// Override the default render
export { customRender as render };
