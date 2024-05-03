import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/index.css";

import { App } from "./App";
import { Home } from "./routes/Home";
import { Error } from "./routes/Error";
import {
  Input as NSLookupInput,
  Output as NSLookupOutput,
} from "./routes/Nslookup";
import {
  Input as IPInfoInput,
  Output as IPInfoOutput,
  loader as IPInfoLoader,
} from "./routes/IPInfo";
import { WhoIs } from "./routes/WhoIs";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/nslookup",
        element: <NSLookupInput />,
        children: [
          {
            path: "/nslookup/:name",
            element: <NSLookupOutput />,
          },
        ],
      },
      {
        path: "/ipinfo",
        element: <IPInfoInput />,
        children: [
          {
            path: "/ipinfo/:ip",
            element: <IPInfoOutput />,
            loader: IPInfoLoader,
          },
        ],
      },
      {
        path: "/whois",
        element: <WhoIs />,
        children: [
          {
            path: "/whois/:name",
            element: <WhoIs />,
          },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
