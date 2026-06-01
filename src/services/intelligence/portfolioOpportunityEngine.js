import { buildOpportunityDecision } from "./opportunityDecisionEngine";

export function buildPortfolioOpportunity(items = []) {
  const evaluated = items.filter(Boolean).map((item) => ({
    ...item,
    decision: item.decision || buildOpportunityDecision(item),
  }));

  const buy = evaluated.filter((item) => item.decision?.action === "BUY");
  const watch = evaluated.filter((item) => item.decision?.action === "WATCH");
  const reject = evaluated.filter((item) => item.decision?.action === "REJECT");

  const requiredCapital = buy.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const expectedProfit = buy.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );

  const averageROI =
    buy.length > 0
      ? Number(
          (
            buy.reduce((sum, item) => sum + Number(item.roi || 0), 0) /
            buy.length
          ).toFixed(2)
        )
      : 0;

  return {
    totalVehicles: evaluated.length,
    buyCount: buy.length,
    watchCount: watch.length,
    rejectCount: reject.length,
    requiredCapital,
    expectedProfit,
    averageROI,
    buy,
    watch,
    reject,
    summary: buildSummary({
      buyCount: buy.length,
      watchCount: watch.length,
      rejectCount: reject.length,
      requiredCapital,
      expectedProfit,
      averageROI,
    }),
  };
}

function buildSummary({
  buyCount,
  watchCount,
  rejectCount,
  requiredCapital,
  expectedProfit,
  averageROI,
}) {
  return {
    buyCount,
    watchCount,
    rejectCount,
    requiredCapital,
    expectedProfit,
    averageROI,
    recommendation:
      buyCount > 0
        ? "Existen oportunidades de compra."
        : "No existen oportunidades claras de compra.",
  };
}