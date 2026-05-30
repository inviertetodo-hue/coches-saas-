import { useMemo, useState } from "react";

import ScannerHeader from "../components/scanner/ScannerHeader";
import ScannerSummaryCard from "../components/scanner/ScannerSummaryCard";
import ScannerResultsSection from "../components/scanner/ScannerResultsSection";
import ScannerForm from "../components/ScannerForm";

import { buildMarketScan } from "../services/marketScanner";
import { useEnrichedMarketFeed } from "../hooks/useEnrichedMarketFeed";
import { useSearchRadar } from "../hooks/useSearchRadar";
import { useMarketTrendProfile } from "../hooks/useMarketTrendProfile";

export default function Scanner() {
  const [form, setForm] = useState({
    query: "BMW X5 45e",
    maxBudget: "60000",
    country: "Europa",
    useCase: "reventa",
  });

  const [searchTriggered, setSearchTriggered] = useState(false);

  const scan = useMemo(() => buildMarketScan(form), [form]);

  const trendProfile = useMarketTrendProfile({
    form,
    scan,
  });

  const marketFeed = useEnrichedMarketFeed({
    searchTriggered,
    scan,
    form,
  });

  const searchRadar = useSearchRadar({
    searchTriggered,
    form,
    scan,
    marketFeed,
  });

  function updateField(field, value) {
    setSearchTriggered(false);

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSearch() {
    setSearchTriggered(true);
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <ScannerHeader />

        <div style={gridStyle}>
          <ScannerForm
            form={form}
            updateField={updateField}
            handleSearch={handleSearch}
          />

          <ScannerSummaryCard
            scan={scan}
            trendProfile={trendProfile}
            searchTriggered={searchTriggered}
            marketFeed={marketFeed}
          />
        </div>

        <ScannerResultsSection
          marketFeed={marketFeed}
          searchRadar={searchRadar}
          scan={scan}
          searchTriggered={searchTriggered}
        />
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 42%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
};