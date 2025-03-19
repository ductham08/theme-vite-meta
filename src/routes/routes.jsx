import { createBrowserRouter } from 'react-router-dom';
import ContenPage from '../pages/contentPage';
import HomePage from '../pages/homePage';

const routes = createBrowserRouter([
  {
    path: "/*",
    element: <ContenPage />
  },
  {
    path: "/",
    element: <HomePage />
  },
]);

export default routes