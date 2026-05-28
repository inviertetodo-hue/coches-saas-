import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoadingScreen from "./components/common/LoadingScreen";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";
import AppSidebar from "./components/layout/AppSidebar";

import "./App.css";

const Scanner = lazy(() => import("./pages/Scanner"));
const Importer = lazy(() => import("./pages/Importer"));
const History = lazy(() => import("./pages/History"));

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AppSidebar />

        <main>
          <RouteErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Scanner />} />

                <Route path="/scanner" element={<Scanner />} />

                <Route path="/importer" element={<Importer />} />

                <Route path="/history" element={<History />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}