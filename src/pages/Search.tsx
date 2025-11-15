import React, { useState, useEffect, useRef } from "react";
import { searchMangaMulti } from "../api/mangaAPI";
import MangaCard from "../components/MangaCard";
import type { MangaSummary } from "../types";

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MangaSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null); // updated line

  // 🧠 Debounce logic: delay search after user stops typing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMangaMulti(query);
        const formatted = data.map((m: any) => ({
          id: m.id,
          title: m.title,
          cover: m.cover,
          source: m.source || "mangadex",
          latestChapter: m.latestChapter || "?",
        }));
        setResults(formatted);
        setError(null);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Search failed due to network issues. Try again later.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce delay

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const SkeletonCard = () => (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden">
      <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-700" />
      <div className="p-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Search Manga</h1>

      {/* 🔎 Search bar */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search for manga..."
          value={query}
          onChange={handleInputChange}
          aria-label="Search manga"
          className="flex-1 border p-2 rounded-l text-gray-800 dark:bg-gray-900 dark:text-white"
        />
        <button
          disabled={loading}
          className="bg-blue-500 text-white px-4 rounded-r disabled:bg-gray-400"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && results.length === 0 && query.trim() && (
        <p>No results found for “{query}”. Try a different query.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : results.map((manga) => <MangaCard key={manga.id} manga={manga} />)}
      </div>
    </main>
  );
};

export default Search;
