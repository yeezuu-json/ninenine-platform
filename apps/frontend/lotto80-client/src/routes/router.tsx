import { createBrowserRouter, RouteObject } from 'react-router';
import MainScreen from '../screens/main-screen';
import IframPage from '../screens/iframe';

const routes: RouteObject[] = [
  { path: '/', element: <MainScreen /> },
  { path: '/iframe', element: <IframPage /> },
];

export const router = createBrowserRouter(routes);
