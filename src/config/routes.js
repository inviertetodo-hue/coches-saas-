import { lazy } from "react";

import { ROUTE_PATHS } from "./routePaths";

const Scanner = lazy(() => import("../pages/Scanner"));
const Importer = lazy(() => import("../pages/Importer"));
const History = lazy(() => import("../pages/History"));
const NotFound = lazy(() => import("../pages/NotFound"));

export const APP_ROUTES = [
  {
    id: "home",
    path: ROUTE_PATHS.home,
    element: Scanner,
  },
  {
    id: "scanner",
    path: ROUTE_PATHS.scanner,
    element: Scanner,
  },
  {
    id: "importer",
    path: ROUTE_PATHS.importer,
    element: Importer,
  },
  {
    id: "history",
    path: ROUTE_PATHS.history,
    element: History,
  },
  {
    id: "not-found",
    path: "*",
    element: NotFound,
  },
];