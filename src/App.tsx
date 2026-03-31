import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/core/providers/AppProviders';
import { router } from '@/core/routing/router';

const App = (): JSX.Element => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};

export default App;
