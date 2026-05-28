import MarketFeedSection from "./MarketFeedSection";
import AIInsightsSection from "./AIInsightsSection";
import SearchRadarSection from "./SearchRadarSection";

export default function ScannerResultsSection({ marketFeed, searchRadar }) {
  if (!marketFeed) return null;

  return (
    <>
      <MarketFeedSection marketFeed={marketFeed} />

      <AIInsightsSection insights={marketFeed.insights} />

      <SearchRadarSection searchRadar={searchRadar} />
    </>
  );
}