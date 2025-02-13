import { createBrowserRouter } from "react-router"

import Layout from "@/layout/index"
import Home from "@/pages/home"
import Ticker from "@/pages/ticker"
import Kol from "@/pages/kol"
import NotFound from "@/pages/404"
import ErrorBoundary from "@/pages/error"
import { tickerLoader } from "./loader"
import Loading from "@/components/loading"
const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        path: "",
        Component: Home,
      },
      {
        path: "token",
        children: [
          {
            path: ":ticker",
            Component: Ticker,
            loader: tickerLoader,
            hydrateFallbackElement: <Loading />,
          },
        ],
      },
      {
        path: "detail",
        children: [
          {
            path: ":kol",
            Component: Kol,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
])

export default router
