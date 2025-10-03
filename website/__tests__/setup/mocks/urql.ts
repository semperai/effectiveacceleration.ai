import { Client, Provider } from 'urql';
import { fromValue, never } from 'wonka';
import { ReactNode } from 'react';

// Create a mock URQL client for testing
export const createMockClient = (mocks: any[] = []) => {
  return {
    executeQuery: (query: any) => {
      const mock = mocks.find((m) => {
        const queryMatch = m.request.query === query.query;
        const varsMatch = JSON.stringify(m.request.variables) === JSON.stringify(query.variables);
        return queryMatch && varsMatch;
      });

      if (mock) {
        return fromValue(mock.result);
      }

      return fromValue({ data: null, error: new Error('No mock found') });
    },
    executeMutation: () => never,
    executeSubscription: () => never,
  } as unknown as Client;
};

// URQL Provider wrapper for tests
export const createUrqlWrapper = (mocks: any[] = []) => {
  const client = createMockClient(mocks);

  return ({ children }: { children: ReactNode }) => (
    <Provider value={client}>{children}</Provider>
  );
};
