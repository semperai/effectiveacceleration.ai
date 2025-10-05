import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'urql';
import { vi } from 'vitest';
import { fromValue } from 'wonka';

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Create a default urql client for tests
const mockClient = {
  executeQuery: vi.fn(() => fromValue({ data: undefined, error: undefined })),
  executeMutation: vi.fn(() => fromValue({ data: undefined, error: undefined })),
  executeSubscription: vi.fn(() => fromValue({ data: undefined, error: undefined })),
} as any;

// Custom render function that wraps with providers
export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(
    <Provider value={mockClient}>
      {ui}
    </Provider>,
    { ...options }
  );
}

// Override the default render
export { customRender as render };
