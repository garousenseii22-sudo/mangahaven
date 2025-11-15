// ✅ StackBlitz-safe Asura API (no Node cheerio)
import axios from "axios";

// 🧩 Simple DOMParser-based cheerio-lite
function loadHTML(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return {
    text: (selector: string) =>
      doc.querySelector(selector)?.textContent?.trim() || "",
    attr: (selector: string, name: string) =>
      doc.querySelector(selector)?.getAttribute(name) || "",
    findAll: (selector: string) => Array.from(doc.querySelectorAll(selector)),
  };
}

const ASURA_BASE = "https://asuratoon.com";

export async function fetchAsuraDetails(slug: string) {
  try {
    const url = `${ASURA_BASE}/manga/${slug}/`;
    const { data } = await axios.get(url);
    const $ = loadHTML(data);

    const title = $.text("h1.entry-title");
    const cover =
      $.attr(".summary_image img", "data-src") ||
      $.attr(".summary_image img", "src") ||
      "";
    const description = $.text(".summary__content");
    const author = $.text(".author-content a") || "Unknown";
    const status = $.text(".post-status .summary-content");

    const chapters: any[] = [];
    for (const el of $.findAll(".wp-manga-chapter")) {
      const link = el.querySelector("a");
      if (!link) continue;
      const chapterTitle = link.textContent?.trim() || "";
      const chapterUrl = link.getAttribute("href") || "";
      const parts = chapterUrl.split("/").filter(Boolean);
      const chapterId = parts[parts.length - 1] || "";

      chapters.push({
        key: chapterId,
        title: chapterTitle,
        candidates: [
          {
            chapterId,
            lang: "en",
            group: "AsuraScans",
            externalUrl: chapterUrl,
          },
        ],
        source: "asura",
      });
    }

    return {
      id: slug,
      source: "asura",
      title,
      description,
      cover,
      author,
      status,
      chapters: chapters.reverse(),
    };
  } catch (err) {
    console.error("❌ Asura fetch failed:", err);
    return null;
  }
}

export async function fetchAsuraPages(chapterId: string) {
  try {
    const url = `${ASURA_BASE}/${chapterId}/`;
    const { data } = await axios.get(url);
    const $ = loadHTML(data);

    const pages: string[] = [];
    for (const img of $.findAll(".reading-content img")) {
      const src =
        img.getAttribute("data-src") ||
        img.getAttribute("src") ||
        img.getAttribute("data-lazy-src");
      if (src) pages.push(src);
    }

    return pages;
  } catch (err) {
    console.error("❌ Asura pages error:", err);
    return [];
  }
}
