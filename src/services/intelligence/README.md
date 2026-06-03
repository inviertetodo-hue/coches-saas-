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
Dashboard / History / Radar / Watchlist / Alerts