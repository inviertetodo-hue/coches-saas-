export function parseCarFromUrl(url) {
  if (!url) {
    return null;
  }

  const cleanUrl = url.toLowerCase();

  const brands = [
    "bmw",
    "audi",
    "mercedes",
    "volkswagen",
    "porsche",
    "toyota",
    "ford",
    "seat",
    "cupra",
    "peugeot",
    "renault",
    "kia",
    "hyundai",
    "ferrari",
    "lamborghini",
  ];

  let detectedBrand = "";

  for (const brand of brands) {
    if (cleanUrl.includes(brand)) {
      detectedBrand =
        brand.charAt(0).toUpperCase() +
        brand.slice(1);

      break;
    }
  }

  let detectedModel = "";

  const urlParts =
    cleanUrl.split("/").join("-").split("-");

  const filteredParts = urlParts.filter(
    (part) =>
      part &&
      part.length > 1 &&
      !part.includes("http") &&
      !part.includes("www") &&
      !part.includes(".de") &&
      !part.includes(".com")
  );

  if (filteredParts.length > 0) {
    detectedModel = filteredParts
      .slice(0, 6)
      .join(" ");
  }

  detectedModel = detectedModel
    .replaceAll("bmw", "")
    .replaceAll("audi", "")
    .replaceAll("mercedes", "")
    .replaceAll("volkswagen", "")
    .replaceAll("porsche", "")
    .replaceAll("toyota", "")
    .replaceAll("ford", "")
    .replaceAll("seat", "")
    .replaceAll("cupra", "")
    .replaceAll("peugeot", "")
    .replaceAll("renault", "")
    .replaceAll("kia", "")
    .replaceAll("hyundai", "")
    .replaceAll("ferrari", "")
    .replaceAll("lamborghini", "")
    .replace(/\s+/g, " ")
    .trim();

  const finalTitle = [
    detectedBrand,
    detectedModel,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    brand: detectedBrand,
    model: detectedModel,
    title: finalTitle,
  };
}