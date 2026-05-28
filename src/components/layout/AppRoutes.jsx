import { Routes, Route } from "react-router-dom";

import { APP_ROUTES } from "../../config/routes";

export default function AppRoutes() {
  return (
    <Routes>
      {APP_ROUTES.map((route) => {
        const Page = route.element;

        return <Route key={route.id} path={route.path} element={<Page />} />;
      })}
    </Routes>
  );
}