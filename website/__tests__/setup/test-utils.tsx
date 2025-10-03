import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Client, Provider as UrqlProvider, fetchExchange } from 'urql';
import { never } from 'wonka';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Create a simple mock URQL client
const urqlClient = {
  executeQuery: () => never,
  executeMutation: () => never,
  executeSubscription: () => never,
} as unknown as Client;

interface AllTheProvidersProps {
  children: React.ReactNode;
}

export function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UrqlProvider value={urqlClient}>
        {children}
      </UrqlProvider>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
