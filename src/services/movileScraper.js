export async function scrapeMobileDe(url) {
  try {
    const response = await fetch(url);

    const html = await response.text();

    return html;
  } catch (error) {
    console.error(error);

    return "";
  }
}