export const LISTING_STATUS = {
  ACTIVE: "ACTIVE",
  SOLD: "SOLD",
  EXPIRED: "EXPIRED",
  ARCHIVED: "ARCHIVED",
};

export function buildListingLifecycle(record = {}, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const firstSeenAt = parseDate(record.first_seen_at || record.firstSeenAt || record.savedAt || now);
  const lastSeenAt = parseDate(record.last_seen_at || record.lastSeenAt || record.savedAt || now);

  const daysSinceLastSeen = diffDays(now, lastSeenAt);
  const daysSinceFirstSeen = diffDays(now, firstSeenAt);

  const expiredAfterDays = normalizeNumber(options.expiredAfterDays, 30);
  const archivedAfterDays = normalizeNumber(options.archivedAfterDays, 90);

  const status = detectStatus({
    currentStatus: record.status,
    daysSinceLastSeen,
    expiredAfterDays,
    archivedAfterDays,
  });

  return {
    status,
    first_seen_at: firstSeenAt.toISOString(),
    last_seen_at: lastSeenAt.toISOString(),
    daysSinceFirstSeen,
    daysSinceLastSeen,
    isActive: status === LISTING_STATUS.ACTIVE,
    isHistorical: status !== LISTING_STATUS.ACTIVE,
    shouldFeedRadar: status === LISTING_STATUS.ACTIVE,
    shouldFeedValuation: true,
    lifecycleSummary: buildSummary({
      status,
      daysSinceLastSeen,
      daysSinceFirstSeen,
    }),
  };
}

export function enrichWithListingLifecycle(records = [], options = {}) {
  return records.filter(Boolean).map((record) => ({
    ...record,
    lifecycle: buildListingLifecycle(record, options),
  }));
}

export function splitLiveAndHistorical(records = [], options = {}) {
  const enriched = enrichWithListingLifecycle(records, options);

  const active = enriched.filter(
    (record) => record.lifecycle.status === LISTING_STATUS.ACTIVE
  );

  const historical = enriched.filter(
    (record) => record.lifecycle.status !== LISTING_STATUS.ACTIVE
  );

  return {
    total: enriched.length,
    active,
    historical,
    activeCount: active.length,
    historicalCount: historical.length,
  };
}

function detectStatus({
  currentStatus,
  daysSinceLastSeen,
  expiredAfterDays,
  archivedAfterDays,
}) {
  const normalizedStatus = String(currentStatus || "").toUpperCase();

  if (
    normalizedStatus === LISTING_STATUS.SOLD ||
    normalizedStatus === LISTING_STATUS.ARCHIVED
  ) {
    return normalizedStatus;
  }

  if (daysSinceLastSeen >= archivedAfterDays) {
    return LISTING_STATUS.ARCHIVED;
  }

  if (daysSinceLastSeen >= expiredAfterDays) {
    return LISTING_STATUS.EXPIRED;
  }

  return LISTING_STATUS.ACTIVE;
}

function buildSummary({
  status,
  daysSinceLastSeen,
  daysSinceFirstSeen,
}) {
  if (status === LISTING_STATUS.ACTIVE) {
    return `Anuncio activo. Visto por última vez hace ${daysSinceLastSeen} días.`;
  }

  if (status === LISTING_STATUS.EXPIRED) {
    return `Anuncio expirado. No debe alimentar el radar actual, pero conserva valor histórico.`;
  }

  if (status === LISTING_STATUS.SOLD) {
    return `Anuncio vendido. Útil para histórico, rotación y valoración futura.`;
  }

  return `Anuncio archivado. Conservado para inteligencia histórica tras ${daysSinceFirstSeen} días desde primera detección.`;
}

function parseDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function diffDays(toDate, fromDate) {
  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.max(0, Math.floor(diffMs / 86400000));
}

function normalizeNumber(value, fallback) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return numericValue;
}