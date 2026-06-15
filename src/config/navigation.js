import { ROUTE_PATHS } from "./routePaths";

export const NAVIGATION_SECTIONS = [
  {
    id: "main",
    label: "Principal",
    items: [
      {
        id: "scanner",
        label: "🎯 Buscar Oportunidades",
        path: ROUTE_PATHS.scanner,
      },
      {
        id: "history",
        label: "📊 Inteligencia Avanzada",
        path: ROUTE_PATHS.history,
      },
    ],
  },
  {
    id: "advanced",
    label: "Herramientas avanzadas",
    items: [
      {
        id: "importer",
        label: "🔗 Importador",
        path: ROUTE_PATHS.importer,
      },
      {
        id: "bulk-import",
        label: "🌍 Bulk Import",
        path: ROUTE_PATHS.bulkImport,
      },
      {
        id: "calculator",
        label: "🧮 Calculadora de importación",
        path: ROUTE_PATHS.calculator,
      },
    ],
  },
];

export const NAVIGATION_ITEMS = NAVIGATION_SECTIONS.flatMap((section) => section.items);