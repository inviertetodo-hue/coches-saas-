# COCHES SAAS — ESTADO ACTUAL OFICIAL

## PRODUCCIÓN

Repo:
https://github.com/inviertetodo-hue/coches-saas-

Carpeta local:
~/proyectos/coches-saas-

Rama producción Netlify:
feature/autoscout-detail-card-isolated

Commit producción actual:
9187b05 — fix: restore stable real market feed

## REFERENCIA HISTÓRICA BUENA

Commit:
cea81b8 — checkpoint: close autoscout url fallback strategy

Rama de prueba creada:
test-cea81b8

Uso:
Solo comparar comportamiento histórico. No trabajar sobre ella.

## NO TOCAR

- main
- radarV2
- Netlify
- calculadora
- diseño
- responsive
- ramas antiguas

## PROBLEMA REAL PENDIENTE

El Radar encuentra coches, pero debe separar:

1. OPORTUNIDAD VERIFICADA
   - URL individual real
   - anuncio abrible
   - identidad confirmada
   - puede ser TOP / BUY

2. CANDIDATA
   - URL de búsqueda
   - identidad heredada
   - puede mostrarse
   - no puede ser TOP / BUY

## REGLA FINAL

Sin URL individual verificable no hay BUY ni TOP OPPORTUNITY.

## SIGUIENTE TRABAJO

Solo tocar:
src/services/market/realMarketFeed.js
y, si hace falta, la tarjeta que pinta la decisión.

Objetivo:
añadir hasIndividualListingUrl / verificationLevel y capar BUY/TOP si no está verificado.

## VALIDACIÓN FINAL

Probar:
- BMW X5
- Audi Q5
- Fiat Panda

Comprobar:
- encuentra coches
- URL abre anuncio real
- TOP tiene URL individual
- BUY solo si hay anuncio verificable
- margen neto positivo
