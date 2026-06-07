# Coches.net Spain Feed Evidence

## Endpoint confirmado

POST https://web.gw.coches.net/search/listing

## Endpoint auxiliar

GET https://web.gw.coches.net/vehicle-specs/makemodels

## BMW X5

- makeId: 7
- modelId: 438
- HTTP: 200
- totalResults: 1099
- totalPages: 37
- items page 1: 30
- urls page 1: 30/30
- market average page 1: 25/30
- median price page 1: 44.995 €
- median market average page 1: 49.100 €
- page 2 HTTP: 200
- page 2 items: 30
- page 2 urls: 30/30
- page 2 market average: 23/30

## Audi Q5

- makeId: 4
- modelId: 904
- HTTP: 200
- totalResults: 1256
- totalPages: 42
- items page 1: 30
- urls page 1: 30/30
- market average page 1: 26/30
- median price page 1: 32.900 €
- median market average page 1: 33.650 €

## Campos útiles detectados

- id
- title
- url
- price.amount
- price.indicator.average
- price.indicator.rank
- km
- year
- hp
- fuelType
- mainProvince
- publishedDate
- seller.isProfessional
- warranty.months
- environmentalLabel
- resources[].url

## Conclusión

Coches.net puede usarse como fuente estructurada española para alimentar el Radar de Oportunidades.

La fuente permite calcular:

- valor mercado España
- precio medio España
- comparables reales por modelo
- dispersión por año/km
- señales de oportunidad
- URLs reales de anuncios
- validación contra precio de compra en Alemania

