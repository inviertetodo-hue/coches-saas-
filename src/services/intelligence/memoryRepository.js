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

    validItems.forEach((item) => {
      const fingerprint = buildFingerprint(item);

      if (existingFingerprints.has(fingerprint)) {
        skippedRecords.push({
          ...item,
          fingerprint,
          skippedReason: "duplicate",
        });

        return;
      }

      const savedRecord = {
        id: buildId(),
        savedAt: new Date().toISOString(),
        fingerprint,
        ...item,
      };

      records.push(savedRecord);
      existingFingerprints.add(fingerprint);
      insertedRecords.push(savedRecord);
    });

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
    return [...records];
  }

  function getByBrand(brand) {
    const normalized = normalize(brand);

    return records.filter(
      (item) => normalize(item.brand) === normalized
    );
  }

  function getByModel(brand, model) {
    const normalizedBrand = normalize(brand);
    const normalizedModel = normalize(model);

    return records.filter(
      (item) =>
        normalize(item.brand) === normalizedBrand &&
        normalize(item.model) === normalizedModel
    );
  }

  function count() {
    return records.length;
  }

  function clear() {
    records.length = 0;
    persistRecords();
  }

  return {
    saveMany,
    getAll,
    getByBrand,
    getByModel,
    count,
    clear,
  };
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
  return storedRecords
    .filter(Boolean)
    .map((item) => ({
      ...item,
      fingerprint: item.fingerprint || buildFingerprint(item),
    }));
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

function buildFingerprint(item = {}) {
  return [
    normalize(item.brand),
    normalize(item.model),
    normalize(item.year),
    normalizeNumber(item.price),
    normalizeNumber(item.km),
  ]
    .filter(Boolean)
    .join("|");
}

function normalizeNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "";
  }

  return String(Math.round(numericValue));
}

function buildId() {
  return [
    "mem",
    Date.now(),
    Math.random().toString(36).slice(2, 8),
  ].join("_");
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}