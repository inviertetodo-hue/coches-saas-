import { buildListingIdentity } from "./listingIdentityEngine";
import { buildListingLifecycle, LISTING_STATUS } from "./marketListingLifecycleEngine";

const STORAGE_KEY = "coches_saas_memory_records_v1";

let records = normalizeStoredRecords(loadRecordsFromStorage());

export function createMemoryRepository() {
  function saveMany(items = []) {
    const validItems = items.filter(Boolean);
    const existingFingerprints = new Set(
      records.map((item) => item.fingerprint).filter(Boolean)
    );

    const insertedRecords = [];
    const skippedRecords = [];
    const now = new Date().toISOString();

    validItems.forEach((item) => {
      const identity = buildListingIdentity(item);
      const fingerprint = identity.fingerprint;

      if (existingFingerprints.has(fingerprint)) {
        const existingRecord = records.find(
          (record) => record.fingerprint === fingerprint
        );

        if (existingRecord) {
          existingRecord.last_seen_at = now;
          existingRecord.updated_at = now;
          existingRecord.status = LISTING_STATUS.ACTIVE;
          existingRecord.sourceSite = existingRecord.sourceSite || identity.sourceSite;
          existingRecord.sourceUrl = existingRecord.sourceUrl || identity.sourceUrl;
          existingRecord.listingId = existingRecord.listingId || identity.listingId;
          existingRecord.fingerprintVersion = identity.fingerprintVersion;
          existingRecord.identityConfidence = identity.identityConfidence;
          existingRecord.lifecycle = buildListingLifecycle(existingRecord);
        }

        skippedRecords.push({
          ...item,
          ...identity,
          skippedReason: "duplicate_refreshed",
        });

        return;
      }

      const savedRecord = {
        id: buildId(),
        savedAt: now,
        created_at: now,
        updated_at: now,
        first_seen_at: now,
        last_seen_at: now,
        status: LISTING_STATUS.ACTIVE,
        ...item,
        ...identity,
      };

      savedRecord.lifecycle = buildListingLifecycle(savedRecord);

      records.push(savedRecord);
      existingFingerprints.add(fingerprint);
      insertedRecords.push(savedRecord);
    });

    refreshLifecycle();
    persistRecords();

    return {
      inserted: insertedRecords.length,
      skipped: skippedRecords.length,
      totalRecords: records.length,
      records: insertedRecords,
      skippedRecords,
    };
  }

  function getAll() {
    refreshLifecycle();
    return [...records];
  }

  function getActive() {
    refreshLifecycle();
    return records.filter((item) => item.status === LISTING_STATUS.ACTIVE);
  }

  function getHistorical() {
    refreshLifecycle();
    return records.filter((item) => item.status !== LISTING_STATUS.ACTIVE);
  }

  function getByBrand(brand) {
    const normalized = normalize(brand);

    refreshLifecycle();

    return records.filter((item) => normalize(item.brand) === normalized);
  }

  function getByModel(brand, model) {
    const normalizedBrand = normalize(brand);
    const normalizedModel = normalize(model);

    refreshLifecycle();

    return records.filter(
      (item) =>
        normalize(item.brand) === normalizedBrand &&
        normalize(item.model) === normalizedModel
    );
  }

  function markAsSold(fingerprint) {
    return updateStatus(fingerprint, LISTING_STATUS.SOLD);
  }

  function markAsExpired(fingerprint) {
    return updateStatus(fingerprint, LISTING_STATUS.EXPIRED);
  }

  function markAsArchived(fingerprint) {
    return updateStatus(fingerprint, LISTING_STATUS.ARCHIVED);
  }

  function count() {
    return records.length;
  }

  function clear() {
    records.length = 0;
    persistRecords();
  }

  function getLifecycleSummary() {
    refreshLifecycle();

    return {
      total: records.length,
      active: records.filter((item) => item.status === LISTING_STATUS.ACTIVE)
        .length,
      sold: records.filter((item) => item.status === LISTING_STATUS.SOLD)
        .length,
      expired: records.filter((item) => item.status === LISTING_STATUS.EXPIRED)
        .length,
      archived: records.filter((item) => item.status === LISTING_STATUS.ARCHIVED)
        .length,
    };
  }

  return {
    saveMany,
    getAll,
    getActive,
    getHistorical,
    getByBrand,
    getByModel,
    markAsSold,
    markAsExpired,
    markAsArchived,
    count,
    clear,
    getLifecycleSummary,
  };
}

function updateStatus(fingerprint, status) {
  const normalizedFingerprint = String(fingerprint || "");

  const record = records.find(
    (item) => item.fingerprint === normalizedFingerprint
  );

  if (!record) {
    return {
      updated: false,
      reason: "record_not_found",
    };
  }

  const now = new Date().toISOString();

  record.status = status;
  record.updated_at = now;
  record.lifecycle = buildListingLifecycle(record);

  persistRecords();

  return {
    updated: true,
    record,
  };
}

function refreshLifecycle() {
  records = records.map((item) => {
    const lifecycle = buildListingLifecycle(item);

    return {
      ...item,
      status: lifecycle.status,
      first_seen_at: lifecycle.first_seen_at,
      last_seen_at: lifecycle.last_seen_at,
      lifecycle,
    };
  });

  persistRecords();
}

function loadRecordsFromStorage() {
  if (!isBrowserStorageAvailable()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(Boolean);
  } catch (error) {
    console.warn("[memoryRepository] Could not load memory records", error);
    return [];
  }
}

function normalizeStoredRecords(storedRecords = []) {
  const now = new Date().toISOString();

  return storedRecords.filter(Boolean).map((item) => {
    const identity = buildListingIdentity(item);

    const normalizedRecord = {
      ...item,
      ...identity,
      status: item.status || LISTING_STATUS.ACTIVE,
      first_seen_at: item.first_seen_at || item.firstSeenAt || item.savedAt || now,
      last_seen_at: item.last_seen_at || item.lastSeenAt || item.savedAt || now,
      created_at: item.created_at || item.savedAt || now,
      updated_at: item.updated_at || item.savedAt || now,
    };

    return {
      ...normalizedRecord,
      lifecycle: buildListingLifecycle(normalizedRecord),
    };
  });
}

function persistRecords() {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn("[memoryRepository] Could not persist memory records", error);
  }
}

function isBrowserStorageAvailable() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function buildId() {
  return ["mem", Date.now(), Math.random().toString(36).slice(2, 8)].join("_");
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}