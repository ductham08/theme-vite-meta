import { createBrowserRouter } from "react-router-dom";
import ContenPage from "../pages/contentPage";
import HomePage from "../pages/homePage";
import SocialPage from "../pages/socialPage";
import { isBot } from "../utils";

const routes = createBrowserRouter([
  {
    path: "/*",
    element: isBot() ? <SocialPage /> : <ContenPage />,
  },
  {
    path: "/",
    element: <HomePage />,
  },
]);

export default routes;
