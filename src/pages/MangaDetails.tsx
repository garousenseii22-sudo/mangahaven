import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchMangaDetailsMulti } from "../api/mangaAPI";
import { useManga } from "../context/MangaContext";

interface ChapterCandidate {
  chapterId: string;
  lang?: string;
  group?: string;
  createdAt?: string;
  externalUrl?: string | null;
}

interface Chapter {
  key: string;
  title?: string;
  chapter?: string;
  candidates?: ChapterCandidate[];
  source?: string;
}

interface Manga {
  id: string;
  source?: string;
  title: string;
  description?: string;
  cover: string;
  author?: string;
  status?: string;
  chapters?: Chapter[];
}

const MangaDetails: React.FC = () => {
  const { mangaId } = useParams<{ mangaId?: string }>();
  const navigate = useNavigate();
  const { setManga } = useManga();

  const [manga, setMangaState] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mangaId) {
      setError("Invalid manga ID.");
      setLoading(false);
      return;
    }
  
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const details = await fetchMangaDetailsMulti(mangaId);
        if (!details) throw new Error("Manga details not found.");
  
        setMangaState(details);
        setChapters(details.chapters || []);
        setManga(details);
      } catch (err) {
        console.error("❌ Error loading manga details:", err);
        setError(err instanceof Error ? err.message : "Failed to load manga data.");
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [mangaId, setManga]);
  

  if (loading)
    return <p className="p-6 text-gray-600">Loading manga details...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!manga) return <p className="p-6">Manga not found!</p>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 📘 Cover */}
        <img
          src={manga.cover}
          alt={manga.title}
          className="w-64 h-96 object-cover rounded-lg shadow-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://i.imgur.com/0KFBHTB.png";
          }}
        />

        {/* 📄 Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{manga.title}</h1>
          {manga.description && (
            <p className="text-gray-700 mb-4 whitespace-pre-line">
              {manga.description}
            </p>
          )}
          <p className="text-gray-500 mb-2">
            <strong>Author:</strong> {manga.author || "Unknown"}
          </p>
          <p className="text-gray-500 mb-4">
            <strong>Status:</strong> {manga.status || "N/A"}
          </p>

          {/* 📑 Chapter List */}
          <h2 className="text-lg font-semibold mb-2">
            Chapters ({chapters.length})
          </h2>

          {chapters.length === 0 ? (
            <p className="text-gray-400">No chapters found.</p>
          ) : (
            <ul className="space-y-2 max-h-[400px] overflow-y-auto border p-3 rounded-lg">
              {chapters.map((ch) => {
                // ✅ Detect internal (MangaDex) or external (Asura) chapters
                const firstValid =
                  ch.candidates && ch.candidates.find((c) => !!c.chapterId);
                const externalCandidate =
                  ch.candidates && ch.candidates.find((c) => !!c.externalUrl);

                const linkTarget =
                  firstValid?.chapterId && manga.id
                    ? `/chapter/${manga.source || "mangadex"}/${
                        firstValid.chapterId
                      }/${manga.id}`
                    : null;

                const title =
                  ch.title ||
                  (ch.chapter ? `Chapter ${ch.chapter}` : "Untitled Chapter");

                return (
                  <li
                    key={ch.key || ch.chapter || ch.title}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition"
                  >
                    {/* ✅ MangaDex/Internal */}
                    {linkTarget ? (
                      <Link
                        to={linkTarget}
                        onClick={() => setManga(manga)}
                        className="text-blue-600 hover:underline flex-1"
                      >
                        {title}
                      </Link>
                    ) : externalCandidate ? (
                      /* ✅ Asura / External link */
                      <a
                        href={externalCandidate.externalUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline flex-1"
                      >
                        {title} 🌐
                      </a>
                    ) : (
                      /* ❌ Invalid */
                      <span className="text-gray-400 flex-1">
                        Invalid chapter
                      </span>
                    )}

                    {/* 🧩 Tag / Label */}
                    {externalCandidate ? (
                      <div className="w-24 h-16 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs font-medium">
                        External
                      </div>
                    ) : linkTarget ? (
                      <div className="w-24 h-16 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-medium">
                        Preview
                      </div>
                    ) : (
                      <div className="w-24 h-16 bg-gray-200 text-gray-500 rounded flex items-center justify-center text-xs">
                        N/A
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;
