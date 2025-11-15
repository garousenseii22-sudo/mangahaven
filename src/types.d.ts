// ✅ src/types.d.ts
export interface MangaSummary {
  id: string;
  title: string;
  cover: string;
  latestChapter?: string;
  source?: string; // 🔥 add this line — used for identifying API source
}
