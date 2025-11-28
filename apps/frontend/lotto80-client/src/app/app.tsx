import {
  AppProvider,
  Lotto80Provider,
  ThemeProvider,
  OperatorThemeProvider,
  getOperatorId,
} from '@ninenine/core-provider';
import { BetModalProvider } from '../contexts/bet-modal-context';
import { RouterProvider } from 'react-router';
import { router } from '../routes/router';

export function App() {
  // Get operator ID from subdomain, URL param, or env variable
  const operatorId = getOperatorId();

  return (
    <AppProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <OperatorThemeProvider
          operatorId={operatorId}
          apiBaseUrl="http://localhost:3002/api/v1"
          onThemeLoaded={(theme) => {
            console.log('Operator theme loaded:', theme);
          }}
          onThemeError={(error) => {
            console.error('Failed to load operator theme:', error);
          }}
        >
          <Lotto80Provider
            socketUrl="http://localhost:3005/lotto80"
            snapshotUrl="http://localhost:3002/api/lotto80/current-round"
          >
            <BetModalProvider>
              <RouterProvider router={router} />
            </BetModalProvider>
          </Lotto80Provider>
        </OperatorThemeProvider>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
