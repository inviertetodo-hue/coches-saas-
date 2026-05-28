import { lazy } from "react";

const Scanner = lazy(() => import("../pages/Scanner"));
const Importer = lazy(() => import("../pages/Importer"));
const History = lazy(() => import("../pages/History"));

export const APP_ROUTES = [
  {
    id: "home",
    path: "/",
    element: Scanner,
  },
  {
    id: "scanner",
    path: "/scanner",
    element: Scanner,
  },
  {
    id: "importer",
    path: "/importer",
    element: Importer,
  },
  {
    id: "history",
    path: "/history",
    element: History,
  },
];