import axios from "axios";

const COMICK_BASE = "https://api.comick.app";

/**
 * Fetch manga details and chapters from Comick.app
 */
export async function fetchComickDetails(slug: string) {
  try {
    const { data: manga } = await axios.get(`${COMICK_BASE}/comic/${slug}`);
    const { data: chapters } = await axios.get(
      `${COMICK_BASE}/chapter/?comic_id=${manga.id}&limit=500`
    );

    return {
      id: slug,
      source: "comick",
      title: manga.title || manga.slug,
      description: manga.desc || "No description available.",
      cover: manga.cover_url || "",
      author: manga.author || "Unknown",
      status: manga.status || "N/A",
      chapters: chapters.map((ch: any) => ({
        key: ch.hid,
        title: `Chapter ${ch.chap || ""} ${ch.title ? `- ${ch.title}` : ""}`.trim(),
        candidates: [
          {
            chapterId: ch.hid,
            lang: ch.lang || "en",
            group: ch.group_name || "Comick",
          },
        ],
        source: "comick",
      })),
    };
  } catch (err) {
    console.error("❌ Comick fetch failed:", err);
    return null;
  }
}

/**
 * Fetch all pages (images) of a specific chapter
 */
export async function fetchComickPages(chapterId: string) {
  try {
    const { data } = await axios.get(`${COMICK_BASE}/chapter/${chapterId}`);
    return data.chapter?.images?.map((img: any) => img.url) || [];
  } catch (err) {
    console.error("❌ Comick pages error:", err);
    return [];
  }
}
