// Calculadora de costes de importación configurable por el usuario.
// Inspirada en el modelo de Vyndek (costes itemizados y editables) pero
// adaptada a Coches SaaS: el usuario decide sus propios costes y el
// sistema recalcula en tiempo real coste total, beneficio, ROI, capital
// necesario y precio máximo de compra.

export function getDefaultImportCosts(country = "") {
  const transport = country === "Alemania" ? 900 : 1200;

  return {
    transport,
    registration: 750,
    gestor: 450,
    itv: 350,
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
  otros = 0,
  margenDeseado = 0,
  expectedSalePrice = 0,
}) {
  const price = safeNumber(purchasePrice);
  const sale = safeNumber(expectedSalePrice);
  const margin = safeNumber(margenDeseado);

  const costeTotal =
    safeNumber(transport) +
    safeNumber(registration) +
    safeNumber(gestor) +
    safeNumber(itv) +
    safeNumber(otros);

  const capitalNecesario = price + costeTotal;
  const beneficio = sale > 0 ? Math.round(sale - capitalNecesario) : 0;
  const roi =
    sale > 0 && capitalNecesario > 0
      ? Number(((beneficio / capitalNecesario) * 100).toFixed(1))
      : 0;
  const precioMaximoCompra =
    sale > 0 ? Math.round(sale - costeTotal - margin) : 0;

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
