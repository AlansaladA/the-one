import { createBrowserRouter, createHashRouter } from "react-router"
import Layout from "@/layout/index"
import Home from "@/pages/home"
import Ticker from "@/pages/ticker"
import Kol from "@/pages/kol"
import NotFound from "@/pages/404"
const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "",
        Component: Home,
      },
      {
        path: "token",
        children:[
          {
            path:":ticker",
            Component: Ticker,
          }
        ]
      },
      {
        path: "detail",
        children:[
          {
            path:":kol",
            Component:Kol
          }
        ]
      }
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
])

export default router