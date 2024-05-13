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
  loader as NSLookupLoader,
} from "./routes/Nslookup";
import {
  Input as IPInfoInput,
  Output as IPInfoOutput,
  loader as IPInfoLoader,
} from "./routes/IPInfo";
import {
  Input as WhoisInput,
  Output as WhoisOutput,
  loader as WhoisLoader,
} from "./routes/Whois";
import {
  Input as CertsInput,
  Output as CertsOutput,
  loader as CertsLoader,
} from "./routes/Certs";

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
            path: "/nslookup/:domain",
            element: <NSLookupOutput />,
            loader: NSLookupLoader,
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
        element: <WhoisInput />,
        children: [
          {
            path: "/whois/:domain",
            element: <WhoisOutput />,
            loader: WhoisLoader,
          },
        ],
      },
      {
        path: "/certs",
        element: <CertsInput />,
        children: [
          {
            path: "/certs/:domain",
            element: <CertsOutput />,
            loader: CertsLoader,
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
