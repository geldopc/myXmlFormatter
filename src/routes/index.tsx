import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "@templates/AppLayout";
import { Home } from "@pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout title="MyXmlFormatter" />,
    children: [{ index: true, element: <Home /> }],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
