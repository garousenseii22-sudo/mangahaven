// ✅ src/api/mangaAPI.ts — Final Unified MangaDex ⇄ Comick API
// 🧠 With Smart localStorage + Map Cache + Bidirectional Fallback
import axios from "axios";

// 🧱 Types
type ChapterCandidate = {
  chapterId: string;
  mangaId?: string;
  title: string;
  chapter: string | null;
  lang?: string | null;
  group?: string | null;
  externalUrl?: string | null;
  createdAt?: string | null;
  volume?: string | null;
  source?: string;
  isExternal?: boolean;
};

// 🌐 Base URLs
const MANGADEX_BASE = "https://api.mangadex.org";
const COMICK_BASE = "https://api.comick.io";
const CORS_PROXY = "https://cors-proxy.senseiigarou.workers.dev/?url=";
const IS_BROWSER = typeof window !== "undefined" && typeof window.fetch === "function";

// 💾 Cache Constants
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const chapterPagesCache = new Map<string, { pages: string[]; timestamp: number }>();

// 💤 Helpers
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 💾 LocalStorage Helper Functions
function getCache<T>(key: string): T | null {
  if (!IS_BROWSER) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  if (!IS_BROWSER) return;
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // ignore quota errors silently
  }
}

// 🧩 Safe Fetch
async function safeFetch(url: string, retries = 3, delayMs = 1000): Promise<Response> {
  for (let i = 1; i <= retries; i++) {
    const proxied =
      IS_BROWSER && !url.startsWith(CORS_PROXY)
        ? `${CORS_PROXY}${encodeURIComponent(url)}`
        : url;
    try {
      const res = await fetch(proxied);
      if (res.ok) return res;
      console.warn(`⚠️ Retry [${i}/${retries}] ${url}`);
      await delay(delayMs);
    } catch {
      await delay(delayMs);
    }
  }
  throw new Error(`❌ Failed to fetch ${url}`);
}

const safeJson = async (res: Response) => await res.json();

// =============================
// 📚 MANGADEX SECTION
// =============================
export async function fetchLatestManga() {
  const cacheKey = "latestMangaDex";
  const cached = getCache<any[]>(cacheKey);
  if (cached) return cached;

  const url = `${MANGADEX_BASE}/manga?order[latestUploadedChapter]=desc&limit=20&includes[]=cover_art`;
  const res = await safeFetch(url);
  const data = await safeJson(res);
  if (data.result !== "ok") throw new Error("Invalid MangaDex response");

  const result = data.data.map((m: any) => {
    const coverFile = m.relationships.find((r: any) => r.type === "cover_art")
      ?.attributes?.fileName;
    const title =
      m.attributes?.title?.en || Object.values(m.attributes.title || {})[0] || "Unknown";
    const coverUrl = coverFile
      ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg`
      : "https://i.imgur.com/0KFBHTB.png";
    return {
      id: m.id,
      title,
      cover: `${CORS_PROXY}${encodeURIComponent(coverUrl)}`,
      source: "mangadex",
    };
  });

  setCache(cacheKey, result);
  return result;
}

// 🔍 Search Smart
export async function searchMangaMultiSmart(query: string) {
  const cacheKey = `search_${query}`;
  const cached = getCache<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const dex = await searchMangaMulti(query);
    if (dex.length > 0) {
      setCache(cacheKey, dex);
      return dex;
    }
  } catch {
    console.warn("⚠️ MangaDex search failed, fallback to Comick");
  }

  const fallback = await searchComick(query);
  setCache(cacheKey, fallback);
  return fallback;
}

export async function searchMangaMulti(query: string) {
  const url = `${MANGADEX_BASE}/manga?title=${encodeURIComponent(
    query
  )}&limit=20&includes[]=cover_art`;
  const res = await safeFetch(url);
  const data = await safeJson(res);
  if (data.result !== "ok") throw new Error("Bad search");

  return data.data.map((m: any) => {
    const coverFile = m.relationships.find((r: any) => r.type === "cover_art")
      ?.attributes?.fileName;
    const title =
      m.attributes?.title?.en || Object.values(m.attributes.title || {})[0] || "Unknown";
    const coverUrl = coverFile
      ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg`
      : "https://i.imgur.com/0KFBHTB.png";
    return {
      id: m.id,
      title,
      cover: `${CORS_PROXY}${encodeURIComponent(coverUrl)}`,
      source: "mangadex",
    };
  });
}

// 📘 MangaDex Details
export async function fetchMangaDetailsMulti(id: string) {
  const cacheKey = `mangaDex_${id}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  const url = `${MANGADEX_BASE}/manga/${id}?includes[]=cover_art&includes[]=author`;
  const res = await safeFetch(url);
  const data = await safeJson(res);
  const manga = data.data;
  const chapters = await fetchAllChaptersIncludingRelated(id);

  const coverFile = manga.relationships.find((r: any) => r.type === "cover_art")
    ?.attributes?.fileName;
  const coverUrl = coverFile
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.512.jpg`
    : "https://i.imgur.com/0KFBHTB.png";

  const result = {
    id: manga.id,
    title:
      manga.attributes?.title?.en ||
      Object.values(manga.attributes.title || {})[0] ||
      "Unknown",
    description: manga.attributes?.description?.en || "No description available.",
    cover: `${CORS_PROXY}${encodeURIComponent(coverUrl)}`,
    author:
      manga.relationships.find((r: any) => r.type === "author")?.attributes?.name ||
      "Unknown",
    status: manga.attributes.status || "Unknown",
    source: "mangadex",
    chapters,
  };

  setCache(cacheKey, result);
  return result;
}

// 🧩 Related Chapters
async function fetchAllChaptersIncludingRelated(mangaId: string) {
  const url = `${MANGADEX_BASE}/manga/${mangaId}?includes[]=manga`;
  const res = await safeFetch(url);
  const data = await safeJson(res);

  const relatedIds = (data.data.relationships || [])
    .filter((r: any) => r.type === "manga")
    .map((r: any) => r.id);
  const allIds = [mangaId, ...relatedIds];
  const map = new Map<string, ChapterCandidate[]>();

  for (const id of allIds) {
    const raw = await fetchAllChapters(id);
    for (const ch of raw) {
      if (ch.isExternal) continue;
      const key = ch.chapter ? ch.chapter.toString() : ch.title || ch.id;
      const arr = map.get(key) || [];
      arr.push({ ...ch, mangaId: id, source: "mangadex" });
      map.set(key, arr);
    }
    await delay(100);
  }

  const final: any[] = [];
  for (const [, candidates] of map.entries()) {
    const c = candidates[0];
    final.push({
      key: c.chapter || c.title,
      title: c.title,
      chapter: c.chapter,
      candidates,
      chapterId: c.chapterId,
      source: "mangadex",
      isExternal: c.isExternal,
    });
  }

  final.sort((a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0));
  return final;
}

// 📑 Fetch all MangaDex chapters
async function fetchAllChapters(mangaId: string) {
  const limit = 100;
  let offset = 0;
  let all: any[] = [];
  const seen = new Set<string>();

  while (true) {
    const url = `${MANGADEX_BASE}/chapter?manga=${mangaId}&limit=${limit}&offset=${offset}&order[chapter]=asc`;
    const res = await safeFetch(url);
    const data = await safeJson(res);
    if (!data?.data?.length) break;

    const chapters = data.data
      .filter((ch: any) => !ch.attributes?.externalUrl)
      .map((ch: any) => ({
        id: ch.id,
        chapterId: ch.id,
        title: ch.attributes.title || `Chapter ${ch.attributes.chapter || "?"}`,
        chapter: ch.attributes.chapter || null,
        lang: ch.attributes.translatedLanguage,
        externalUrl: ch.attributes.externalUrl || null,
        source: "mangadex",
        isExternal: !!ch.attributes.externalUrl,
      }));

    for (const ch of chapters) {
      if (!seen.has(ch.id)) {
        seen.add(ch.id);
        all.push(ch);
      }
    }

    if (chapters.length < limit) break;
    offset += limit;
  }
  return all;
}

// =============================
// 🌐 COMICK SECTION
// =============================
async function searchComick(query: string) {
  const { data } = await axios.get(`${COMICK_BASE}/v1.0/search?q=${encodeURIComponent(query)}`);
  if (!Array.isArray(data)) return [];
  return data.map((m: any) => ({
    id: m.hid,
    title: m.title,
    cover: `${CORS_PROXY}${encodeURIComponent(m.cover_url)}`,
    source: "comick",
  }));
}

async function fetchComickDetails(hid: string) {
  const cacheKey = `comick_${hid}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${COMICK_BASE}/comic/${hid}`);
  const chaptersRes = await axios.get(`${COMICK_BASE}/comic/${hid}/chapters?lang=en`);
  const chapters = chaptersRes.data.map((ch: any) => ({
    key: ch.hid,
    title: `Chapter ${ch.chap}`,
    chapter: ch.chap,
    candidates: [
      { chapterId: ch.hid, title: `Chapter ${ch.chap}`, source: "comick" },
    ],
    source: "comick",
  }));

  const result = {
    id: hid,
    title: data.title,
    description: data.desc || "No description available.",
    cover: `${CORS_PROXY}${encodeURIComponent(data.cover_url)}`,
    author: data.authors?.[0]?.name || "Unknown",
    status: data.status || "Unknown",
    chapters: chapters.reverse(),
    source: "comick",
  };

  setCache(cacheKey, result);
  return result;
}

async function fetchComickPages(chapterHid: string) {
  const cacheKey = `comick_pages_${chapterHid}`;
  const cached = getCache<string[]>(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${COMICK_BASE}/chapter/${chapterHid}/images`);
  const result = data.map((img: any) => `${CORS_PROXY}${encodeURIComponent(img.url)}`);

  setCache(cacheKey, result);
  return result;
}

// =============================
// 🧠 SMART DETECTION + FALLBACK
// =============================
export async function fetchMangaDetailsMultiSmart(idOrSlug: string) {
  console.log(`🧠 Smart details for: ${idOrSlug}`);
  try {
    const dex = await fetchMangaDetailsMulti(idOrSlug);
    const valid = dex.chapters.filter((c: any) => !c.isExternal);
    if (valid.length === 0) {
      console.warn("⚠️ MangaDex has only external chapters → fallback to Comick");
      return await fetchComickDetails(idOrSlug);
    }
    return dex;
  } catch {
    console.warn("⚠️ MangaDex failed, fallback to Comick");
    return await fetchComickDetails(idOrSlug);
  }
}

// 📄 Chapter Pages Smart with Bidirectional Fallback
export async function fetchChapterPagesSmart(source: string, chapterId: string) {
  console.log(`📖 Fetching pages for [${source}] chapter=${chapterId}`);

  try {
    const pages =
      source === "comick"
        ? await fetchComickPages(chapterId)
        : await fetchChapterPagesMulti(source, chapterId);

    if (!pages?.length) throw new Error("No pages found");
    return pages;
  } catch (err) {
    console.warn(`⚠️ Primary [${source}] failed → fallback attempt`, err);

    // 🔄 Smart fallback logic
    if (source === "mangadex") {
      try {
        return await fetchComickPages(chapterId);
      } catch {
        console.error("❌ Both MangaDex and Comick failed");
      }
    } else if (source === "comick") {
      try {
        return await fetchChapterPagesMulti("mangadex", chapterId);
      } catch {
        console.error("❌ Both Comick and MangaDex failed");
      }
    }
  }

  throw new Error(`No valid chapter pages available for ${source}:${chapterId}`);
}

// 📜 Unified Chapter Page Fetcher (supports MangaDex + Comick)
export async function fetchChapterPagesMulti(source: string, chapterId: string) {
  const cacheKey = `${source}_pages_${chapterId}`;
  const cachedLocal = getCache<string[]>(cacheKey);
  if (cachedLocal) return cachedLocal;

  const cachedMap = chapterPagesCache.get(chapterId);
  if (cachedMap && Date.now() - cachedMap.timestamp < CACHE_TTL_MS)
    return cachedMap.pages;

  try {
    let pages: string[] = [];

    if (source === "mangadex") {
      const res = await safeFetch(`${MANGADEX_BASE}/at-home/server/${chapterId}`);
      const data = await safeJson(res);
      if (!data?.chapter?.data?.length) throw new Error("No MangaDex data found.");

      pages = data.chapter.data.map(
        (img: string) =>
          `${CORS_PROXY}${encodeURIComponent(
            `${data.baseUrl}/data/${data.chapter.hash}/${img}`
          )}`
      );
    } else if (source === "comick") {
      const { data } = await axios.get(`${COMICK_BASE}/chapter/${chapterId}/images`);
      pages = data.map((img: any) => `${CORS_PROXY}${encodeURIComponent(img.url)}`);
    } else {
      throw new Error(`Unsupported source: ${source}`);
    }

    chapterPagesCache.set(chapterId, { pages, timestamp: Date.now() });
    setCache(cacheKey, pages);
    return pages;
  } catch (err) {
    console.error(`❌ Failed to fetch pages for ${source}:${chapterId}`, err);
    throw err;
  }
}
