import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";

import LoadingScreen from "./components/common/LoadingScreen";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";

import AppLayout from "./components/layout/AppLayout";
import AppRoutes from "./components/layout/AppRoutes";
import AppSidebar from "./components/layout/AppSidebar";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout sidebar={<AppSidebar />}>
        <RouteErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <AppRoutes />
          </Suspense>
        </RouteErrorBoundary>
      </AppLayout>
    </BrowserRouter>
  );
}