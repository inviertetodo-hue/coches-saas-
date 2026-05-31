const STORAGE_KEY = "coches_saas_memory_records_v1";

let records = loadRecordsFromStorage();

export function createMemoryRepository() {
  function saveMany(items = []) {
    const validItems = items.filter(Boolean);

    const saved = validItems.map((item) => ({
      id: buildId(),
      savedAt: new Date().toISOString(),
      ...item,
    }));

    records.push(...saved);
    persistRecords();

    return {
      inserted: saved.length,
      totalRecords: records.length,
      records: saved,
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