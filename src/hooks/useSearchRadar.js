import { useMemo } from "react";

import { buildSearchRecommendations } from "../services/searchRecommendationEngine";

export function useSearchRadar({ searchTriggered, form, scan, marketFeed }) {
  return useMemo(() => {
    if (!searchTriggered) return null;

    return buildSearchRecommendations({
      form,
      scan,
      marketFeed,
    });
  }, [form, scan, marketFeed, searchTriggered]);
}