
# Intelligence Architecture

## Objetivo

Coches SaaS no debe guardar todo lo que analiza.

La arquitectura separa claramente:

- Analysis History: análisis útiles para el usuario.
- Market Memory: datos fiables de mercado.
- Opportunity Memory: oportunidades reales con ROI y beneficio positivo.
- Blocked Data: datos incompletos, mock, fallback o no verificables.

---

## Regla principal

Nada debe alimentar la memoria histórica sin pasar por una puerta de calidad.

---

## Flujo oficial

Scanner / Importer / Bulk Import
↓
Adapters
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

---

## Persistence Architecture

### Adapters

Transforman datos de entrada a un formato estándar.

- analysisToMemoryCandidateAdapter.js
- importerPersistenceAdapter.js
- scannerPersistenceAdapter.js
- liveMarketFeedAdapter.js

### Quality

Responsables de validar y clasificar datos.

- dataQualityGate.js
- persistencePolicyEngine.js
- approvedBulkImportEngine.js
- protectedMemorySaveEngine.js

### Memory

Responsables de almacenar, analizar y mantener histórico.

- memoryRepository.js
- memoryAnalyticsEngine.js
- memoryDashboardAdapter.js
- memorySimulationEngine.js
- historicalMemory.js
- historicalConfidence.js
- marketLearningEngine.js
- learningDecisionBonusEngine.js

---

# Domain Map

## Core Pipeline

Motores que forman el núcleo del Radar de Oportunidades.

- masterOpportunityPipelineEngine.js
- decisionPipeline.js
- vehicleValuationEngine.js
- marketValuationEngine.js
- opportunityDecisionEngine.js
- sellSpeedEngine.js
- comparableVehiclesEngine.js

## Quality & Governance

Motores responsables de calidad, persistencia y protección de memoria.

- dataQualityGate.js
- persistencePolicyEngine.js
- approvedBulkImportEngine.js
- protectedMemorySaveEngine.js
- listingIdentityEngine.js
- marketListingLifecycleEngine.js

## Memory

Motores responsables del aprendizaje histórico.

- memoryRepository.js
- memoryAnalyticsEngine.js
- memoryDashboardAdapter.js
- memorySimulationEngine.js
- historicalMemory.js
- historicalConfidence.js
- marketLearningEngine.js
- learningDecisionBonusEngine.js

## Persistence Adapters

Adaptadores de persistencia.

- analysisToMemoryCandidateAdapter.js
- importerPersistenceAdapter.js
- scannerPersistenceAdapter.js
- liveMarketFeedAdapter.js

## Opportunity Intelligence

Motores de scoring, ranking y predicción.

- opportunityScoreEngine.js
- opportunityRankingEngine.js
- topOpportunitiesEngine.js
- opportunityChampionEngine.js
- opportunityPredictorEngine.js
- executiveBuySignalEngine.js
- executiveOpportunityReportEngine.js
- successProbabilityEngine.js

## Portfolio & Strategy

Motores de asignación de capital y estrategia.

- portfolioAllocationEngine.js
- portfolioOpportunityEngine.js
- capitalEfficiencyEngine.js
- inventoryRiskEngine.js
- marketTimingEngine.js

## Support

Motores auxiliares.

- predictiveIntelligenceEngine.js
- intelligenceEngine.js
- rankingUtils.js
- bulkUrlPreviewEngine.js
- bulkDemoCandidates.js

---

# Facade Rule

## intelligenceEngine.js

`intelligenceEngine.js` es una fachada de Dashboard e Historial.

Su función es:

- generar rankings
- generar insights
- detectar tendencias
- construir recomendaciones ejecutivas

No forma parte del núcleo del Radar de Oportunidades.

---

## Regla de futuro

Las funcionalidades futuras del Radar deben depender de:

- masterOpportunityPipelineEngine.js
- opportunityDecisionEngine.js
- vehicleValuationEngine.js
- marketValuationEngine.js
- sellSpeedEngine.js

No deben depender directamente de:

- intelligenceEngine.js

---

## Architectural Principle

Antes de crear un nuevo motor:

1. Comprobar si ya existe una responsabilidad equivalente.
2. Evitar duplicar lógica.
3. Mantener una responsabilidad por archivo.
4. Priorizar estabilidad sobre nuevas funcionalidades.
5. Mantener el Radar de Oportunidades como objetivo principal del producto.

---

## Product Vision

Coches SaaS no es un buscador de coches.

Coches SaaS es un Radar de Oportunidades.

Objetivo:

Usuario define necesidades
↓
Sistema analiza mercado
↓
Valora vehículos
↓
Detecta oportunidades
↓
Prioriza oportunidades
↓
Genera alertas y decisiones BUY / WATCH / REJECT

Toda la arquitectura debe evolucionar hacia ese objetivo.## Future Refactor Candidate

### History.jsx

`src/pages/History.jsx` currently acts as a large orchestration page.

It imports many dashboard, analytics, validation, memory and opportunity services directly.

Current metrics:

- 506 lines
- 6 useMemo blocks
- more than 20 service imports

Future target:

```text
History.jsx
↓
useHistoryIntelligence()
↓
dashboard/intelligence services