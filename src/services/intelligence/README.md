# Intelligence Architecture

## Objetivo

Coches SaaS no debe guardar todo lo que analiza.

La arquitectura separa claramente:

- Analysis History: análisis útiles para el usuario.
- Market Memory: datos fiables de mercado.
- Opportunity Memory: oportunidades reales con ROI/margen positivo.
- Blocked Data: datos incompletos, mock, fallback o no verificables.

## Regla principal

Nada debe alimentar la memoria histórica sin pasar por una puerta de calidad.

## Columna vertebral

```text
Scanner / Importer / Bulk Import
↓
Normalización
↓
Data Quality Gate
↓
Persistence Policy
↓
Protected Memory Save
↓
Memory Repository
↓
Dashboard / History / Radar / Watchlist / Alerts## Known Legacy Paths

Los siguientes archivos todavía utilizan acceso directo a `import_analyses` y no siguen completamente la arquitectura moderna:

### Escritura directa

* src/components/scanner/ScannerResultsSection.jsx
* src/hooks/useEnrichedMarketFeed.js
* src/pages/Importer.jsx

### Lectura directa

* src/pages/History.jsx
* src/pages/Dashboard.jsx
* src/pages/Deals.jsx

## Objetivo de migración

Migrar progresivamente estos flujos hacia:

Component
↓
DataQualityGate
↓
PersistencePolicyEngine
↓
ApprovedBulkImportEngine
↓
ProtectedMemorySaveEngine
↓
MemoryRepository

Sin romper compatibilidad con Supabase durante la transición.

## Prioridad

1. Importer.jsx
2. ScannerResultsSection.jsx
3. useEnrichedMarketFeed.js
4. History.jsx
5. Dashboard.jsx
6. Deals.jsx
