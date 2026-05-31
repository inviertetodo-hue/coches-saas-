export function createMemoryRepository() {
  const records = [];

  function saveMany(items = []) {
    const validItems = items.filter(Boolean);

    const saved = validItems.map((item) => ({
      id: buildId(),
      savedAt: new Date().toISOString(),
      ...item,
    }));

    records.push(...saved);

    return {
      inserted: saved.length,
      records: saved,
    };
  }

  function getAll() {
    return [...records];
  }

  function getByBrand(brand) {
    const normalized = normalize(brand);

    return records.filter((item) => {
      return normalize(item.brand) === normalized;
    });
  }

  function getByModel(brand, model) {
    const normalizedBrand = normalize(brand);
    const normalizedModel = normalize(model);

    return records.filter((item) => {
      return (
        normalize(item.brand) === normalizedBrand &&
        normalize(item.model) === normalizedModel
      );
    });
  }

  function clear() {
    records.length = 0;
  }

  return {
    saveMany,
    getAll,
    getByBrand,
    getByModel,
    clear,
  };
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
}}