import { useMemo } from "react";

import { buildMarketTrendProfile } from "../services/marketTrendEngine";

export function useMarketTrendProfile({ form, scan }) {
  return useMemo(() => {
    return buildMarketTrendProfile({
      query: form.query,
      maxBudget: form.maxBudget,
      semantic: scan.semantic,
    });
  }, [form.query, form.maxBudget, scan.semantic]);
}