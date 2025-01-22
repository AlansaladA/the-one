import { createBrowserRouter, createHashRouter } from "react-router"
import Layout from "@/layout/index"
import Home from "@/pages/home"
const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "",
        Component: Home,
      },
      // {
      //   path: "create",
      //   Component: Create,
      // },
      // {
      //   path: "profile",
      //   Component: Profile,
      // },
      // {
      //   path: "trading",
      //   children: [
      //     {
      //       path: ":address",
      //       Component: Trading,
      //     },
      //   ],
      // },
    ],
  },
  // {
  //   path: "*",
  //   Component: NotFound,
  // },
])

export default router