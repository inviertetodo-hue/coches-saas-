// Calculadora de costes de importación configurable por el usuario.
// Inspirada en el modelo de Vyndek (costes itemizados y editables) pero
// adaptada a Coches SaaS: el usuario decide sus propios costes y el
// sistema recalcula en tiempo real coste total, beneficio, ROI, capital
// necesario y precio máximo de compra.

// Mismos valores base que useEnrichedMarketFeed.estimateImportCosts(), para
// que el "Coste total" de esta calculadora coincida con el "Desglose de
// costes de importación" que ya muestra cada oportunidad del Radar
// (una sola brújula: ambos parten del mismo modelo de costes).
export function getDefaultImportCosts(country = "", price = 0) {
  const transport = country === "Alemania" ? 900 : 1200;
  const riskBuffer = safeNumber(price) >= 70000 ? 1800 : 900;

  return {
    transport,
    registration: 750,
    gestor: 450,
    itv: 350,
    detailing: 400,
    riskBuffer,
    otros: 0,
    margenDeseado: 1500,
  };
}

export function calculateImportResult({
  purchasePrice = 0,
  transport = 0,
  registration = 0,
  gestor = 0,
  itv = 0,
  detailing = 0,
  riskBuffer = 0,
  otros = 0,
  margenDeseado = 0,
  expectedSalePrice = 0,
}) {
  const price = safeNumber(purchasePrice);
  const sale = safeNumber(expectedSalePrice);
  const margin = safeNumber(margenDeseado);
  const hasPrice = price > 0;

  const costeTotal =
    safeNumber(transport) +
    safeNumber(registration) +
    safeNumber(gestor) +
    safeNumber(itv) +
    safeNumber(detailing) +
    safeNumber(riskBuffer) +
    safeNumber(otros);

  // Sin precio de compra, "capital necesario", "beneficio" y "ROI" no se
  // pueden calcular de verdad (no son solo los costes de importación) — se
  // devuelven como null para que la UI muestre "—" en vez de un dato
  // engañoso (p.ej. "capital necesario: 3750€" cuando el precio es 0).
  const capitalNecesario = hasPrice ? price + costeTotal : null;
  const beneficio =
    hasPrice && sale > 0 ? Math.round(sale - capitalNecesario) : null;
  const roi =
    hasPrice && sale > 0 && capitalNecesario > 0
      ? Number(((beneficio / capitalNecesario) * 100).toFixed(1))
      : null;
  const precioMaximoCompra =
    sale > 0 ? Math.round(sale - costeTotal - margin) : null;

  return {
    costeTotal,
    capitalNecesario,
    beneficio,
    roi,
    precioMaximoCompra,
  };
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
