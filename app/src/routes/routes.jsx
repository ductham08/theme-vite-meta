import { createBrowserRouter } from "react-router-dom";
import ContenPage from "../pages/contentPage";
import HomePage from "../pages/homePage";
import SocialPage from "../pages/socialPage";
import { isBot } from "../utils";

// Kiểm tra bot (không dùng hook ở đây)
const isUserBot = isBot();

const routes = createBrowserRouter([
  {
    path: "/*",
    element: isUserBot ? <SocialPage /> : <ContenPage />,
  },
  {
    path: "/",
    element: <HomePage />,
  },
]);

export default routes;
