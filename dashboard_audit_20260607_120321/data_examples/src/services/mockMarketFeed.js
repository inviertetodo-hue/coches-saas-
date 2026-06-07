import { analyzeCar } from "./profitAnalyzer";
import { analyzeComparableMarket } from "./comparableIntelligence";
import { analyzeVehicleMemory } from "./vehicleMemoryEngine";

export function generateMockMarketFeed(scan) {
  const query = String(scan?.query || "BMW X5 45e").trim();

  const listings = buildMockListings(query);

  const opportunities = listings
    .map((car) => {
      const estimatedMarketPrice = Math.round(
        car.price * car.marketMultiplier
      );

      const analysis = analyzeCar({
        ...car,
        estimatedMarketPrice,
      });

      const comparable = analyzeComparableMarket(car);

      const netCosts = estimateImportCosts(car);

      const netProfit = Math.round(
        analysis.estimatedProfit - netCosts.total
      );

      const netRoi =
        car.price > 0
          ? Math.round((netProfit / car.price) * 100)
          : 0;

      const memory = analyzeVehicleMemory({
        ...car,
        comparable,
        netProfit,
        netRoi,
      });

      const opportunityScore =
        calculateOpportunityScore({
          analysis,
          comparable,
          memory,
          netProfit,
          netRoi,
          car,
        });

      return {
        ...car,
        estimatedMarketPrice,
        analysis,
        comparable,
        memory,
        netCosts,
        netProfit,
        netRoi,
        opportunityScore,
        decision: buildDecision({
          opportunityScore,
          netProfit,
          comparable,
          memory,
          analysis,
        }),
      };
    })
    .sort(
      (a, b) =>
        b.opportunityScore - a.opportunityScore
    );

  return {
    total: opportunities.length,
    best: opportunities[0] || null,
    opportunities,
    insights: buildFeedInsights(opportunities),
  };
}

function buildMockListings(query) {
  const text = query.toLowerCase();

  if (text.includes("x5")) {
    return [
      {
        id: "mock-x5-1",
        title: "BMW X5 xDrive45e M Sport",
        brand: "BMW",
        model: "X5",
        price: 57900,
        km: 54500,
        year: 2022,
        country: "Alemania",
        fuelType: "PHEV",
        drivetrain: "xDrive AWD",
        bodyType: "SUV",
        performancePackage: "M Sport",
        electrified: true,
        marketMultiplier: 1.23,
        source: "mobile.de",
      },
      {
        id: "mock-x5-2",
        title: "BMW X5 xDrive50e M Sport Pro",
        brand: "BMW",
        model: "X5",
        price: 74900,
        km: 18500,
        year: 2024,
        country: "Alemania",
        fuelType: "PHEV",
        drivetrain: "xDrive AWD",
        bodyType: "SUV",
        performancePackage: "M Sport",
        electrified: true,
        marketMultiplier: 1.18,
        source: "AutoScout24",
      },
      {
        id: "mock-x5-3",
        title: "BMW X5 xDrive40d",
        brand: "BMW",
        model: "X5",
        price: 52900,
        km: 89000,
        year: 2021,
        country: "Holanda",
        fuelType: "Diesel",
        drivetrain: "xDrive AWD",
        bodyType: "SUV",
        performancePackage: "",
        electrified: false,
        marketMultiplier: 1.12,
        source: "mobile.de",
      },
    ];
  }

  return [
    {
      id: "mock-generic-1",
      title: `${query} Premium Opportunity`,
      brand: detectBrand(query),
      model: query,
      price: 44900,
      km: 42000,
      year: 2022,
      country: "Alemania",
      fuelType: "",
      drivetrain: "",
      bodyType: "",
      performancePackage: "",
      electrified: false,
      marketMultiplier: 1.16,
      source: "mobile.de",
    },
    {
      id: "mock-generic-2",
      title: `${query} Low KM`,
      brand: detectBrand(query),
      model: query,
      price: 51900,
      km: 21000,
      year: 2023,
      country: "Bélgica",
      fuelType: "",
      drivetrain: "",
      bodyType: "",
      performancePackage: "",
      electrified: false,
      marketMultiplier: 1.11,
      source: "AutoScout24",
    },
  ];
}

function estimateImportCosts(car) {
  const transport =
    car.country === "Alemania" ? 900 : 1200;

  const registration = 750;
  const gestor = 450;
  const inspection = 350;
  const detailing = 400;

  const riskBuffer =
    car.price >= 70000 ? 1800 : 900;

  const total =
    transport +
    registration +
    gestor +
    inspection +
    detailing +
    riskBuffer;

  return {
    transport,
    registration,
    gestor,
    inspection,
    detailing,
    riskBuffer,
    total,
  };
}

function calculateOpportunityScore({
  analysis,
  comparable,
  memory,
  netProfit,
  netRoi,
  car,
}) {
  let score = 0;

  score += Number(analysis.score || 0) * 0.28;

  score +=
    Number(
      comparable.underpricingScore || 0
    ) * 0.30;

  score +=
    Number(memory.confidence || 0) * 0.12;

  score +=
    Number(
      memory.resaleSpeed?.score || 0
    ) * 0.15;

  score += Math.max(netRoi, 0) * 1.05;

  score += Math.min(
    Math.max(netProfit, 0) / 1000,
    25
  );

  if (car.fuelType === "PHEV") score += 6;

  if (car.bodyType === "SUV") score += 7;

  if (car.drivetrain) score += 4;

  if (car.km <= 60000) score += 5;

  if (car.price >= 90000) score -= 10;

  return clampScore(score);
}

function buildDecision({
  opportunityScore,
  netProfit,
  comparable,
  memory,
  analysis,
}) {
  if (
    opportunityScore >= 90 &&
    comparable.deviationPercent >= 10 &&
    memory.resaleSpeed?.score >= 75
  ) {
    return "🔥 Chollo detectado";
  }

  if (
    opportunityScore >= 82 &&
    netProfit > 7000
  ) {
    return "🔥 Comprar / llamar rápido";
  }

  if (
    opportunityScore >= 68 &&
    netProfit > 3500
  ) {
    return "🟢 Buena oportunidad";
  }

  if (
    memory.riskLevel?.toLowerCase()
      .includes("alto")
  ) {
    return "⚠️ Riesgo elevado";
  }

  if (opportunityScore >= 52) {
    return "🟡 Analizar con calma";
  }

  if (
    analysis.recommendation ===
    "❌ DESCARTAR"
  ) {
    return "❌ Descartar";
  }

  return "⚠️ Poco margen real";
}

function buildFeedInsights(opportunities) {
  if (!opportunities.length) {
    return [
      "No hay oportunidades suficientes para comparar.",
    ];
  }

  const best = opportunities[0];

  return [
    `🥇 Mejor oportunidad detectada: ${best.title}.`,
    `💰 Margen neto estimado: ${best.netProfit.toLocaleString(
      "es-ES"
    )} €.`,
    `📊 ROI neto estimado: ${best.netRoi}%.`,
    `🧠 Desviación de mercado: ${best.comparable.deviationPercent}%.`,
    `⚡ Probabilidad de venta rápida: ${best.memory.resaleSpeed.label}.`,
    `🎯 Riesgo estimado: ${best.memory.riskLevel}.`,
    best.memory.strategy.reason,
  ];
}

function detectBrand(query) {
  const text = String(query || "")
    .toLowerCase()
    .trim();

  if (text.includes("bmw")) return "BMW";

  if (text.includes("audi")) return "Audi";

  if (text.includes("mercedes"))
    return "Mercedes-Benz";

  if (text.includes("porsche"))
    return "Porsche";

  if (text.includes("volvo")) return "Volvo";

  return "";
}

function clampScore(value) {
  const number = Math.round(
    Number(value || 0)
  );

  if (number > 100) return 100;

  if (number < 0) return 0;

  return number;
}