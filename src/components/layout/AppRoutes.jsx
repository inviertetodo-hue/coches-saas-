import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const Scanner = lazy(() => import("../../pages/Scanner"));
const Importer = lazy(() => import("../../pages/Importer"));
const History = lazy(() => import("../../pages/History"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Scanner />} />

      <Route path="/scanner" element={<Scanner />} />

      <Route path="/importer" element={<Importer />} />

      <Route path="/history" element={<History />} />
    </Routes>
  );
}