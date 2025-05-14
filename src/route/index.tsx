import { createBrowserRouter } from "react-router"

import Layout from "@/layout/index"
import Home from "@/pages/home"
import Ticker from "@/pages/ticker"
import Kol from "@/pages/kol"
import NotFound from "@/pages/404"
import ErrorBoundary from "@/pages/error"
// import { kolLoader, tickerLoader } from "./loader"
import Loading from "@/components/loading"
import { Fragment } from "react/jsx-runtime"
import LoginExtension from "@/pages/extension/login"
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
            path: ":ticker/:ca",
            Component: Ticker,
            loader: ({ params }) => {
              if (!params.ticker) {
                throw new Error("Token Not Found")
              }
              return {
                ticker: params.ticker,
              }
            },
            // loader: tickerLoader,
            // hydrateFallbackElement: <Loading />,
          },
        ],
      },
      {
        path: "detail",
        children: [
          {
            path: ":kol",
            Component: Kol,
            // loader: kolLoader,
            hydrateFallbackElement: <Loading />,
          },
        ],
      }
    ],
  },
  {
    path: "extensionAuth",
    children: [
      {
        path: "login",
        Component: LoginExtension,
      }
    ]
  },
  {
    path: "*",
    Component: NotFound,
  },
])

export default router
