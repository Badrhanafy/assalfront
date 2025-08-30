import { createBrowserRouter } from "react-router-dom";
import Homepage from "../pages/Homepage";
import Products from "../pages/Products";
import About from "../pages/About";
import SlidesManager from "../pages/admin/SlidesManager.jsx";
import Login from "../components/Login";
import Register from "../components/Register";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import ProductDetails from "../pages/ProductDetails.jsx";
import Cart from "../components/Cart.jsx";
import ScrollFloat from "../pages/ScrollFloat.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/about",
    element: <About />,
  },
   {
    path: "/admin/slides",
    element: <SlidesManager />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/Register",
    element: <Register />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "/product/Deetails/:id",
    element: <ProductDetails />,
  },
  {
    path: "/Cart",
    element: <Cart />,
  }
 
]);

export default router;