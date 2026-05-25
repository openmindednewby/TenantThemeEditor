/**
 * Root App component with React Query provider.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize i18n before rendering
import './localization/i18n';

import { EditorLayout } from './components/EditorLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App = (): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <EditorLayout />
  </QueryClientProvider>
);
