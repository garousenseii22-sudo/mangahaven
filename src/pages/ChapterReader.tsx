import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchChapterPagesSmart } from "../api/mangaAPI";
import { useManga } from "../context/MangaContext";
import Ads from "../components/Ads"; // ✅ ADD BANNER HERE

interface ChapterCandidate {
  chapterId: string;
  lang?: string;
  group?: string;
  createdAt?: string;
  externalUrl?: string | null;
  source?: string;
}

interface Chapter {
  key: string;
  title?: string;
  chapter?: string;
  candidates?: ChapterCandidate[];
}

const ChapterReader: React.FC = () => {
  const { mangaId, source: routeSource = "mangadex", chapterId } = useParams<{
    mangaId?: string;
    source?: string;
    chapterId?: string;
  }>();

  const navigate = useNavigate();
  const { manga, setManga } = useManga();

  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);

  // Restore manga context
  useEffect(() => {
    if (!manga) {
      const saved = localStorage.getItem("manga");
      if (saved) {
        try {
          setManga(JSON.parse(saved));
        } catch {}
      }
    } else {
      localStorage.setItem("manga", JSON.stringify(manga));
    }
  }, [manga, setManga]);

  // Load pages
  useEffect(() => {
    const loadPages = async () => {
      if (!chapterId || !manga) {
        setError("Invalid chapter ID or missing manga.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentChapter: Chapter | undefined = manga?.chapters?.find((ch) =>
          ch.candidates?.some((c: ChapterCandidate) => c.chapterId === chapterId)
        );

        if (!currentChapter) {
          setError("Chapter not found.");
          setLoading(false);
          return;
        }

        let actualSource = routeSource;
        const detected = currentChapter?.candidates?.find(
          (c: ChapterCandidate) => c.chapterId === chapterId && c.source
        )?.source;

        if (detected) actualSource = detected;

        const externalCandidate = currentChapter?.candidates?.find(
          (c: ChapterCandidate) => c.externalUrl
        );

        if (externalCandidate?.externalUrl) {
          setError(
            `This chapter is hosted externally. <a href="${externalCandidate.externalUrl}" target="_blank" class="text-blue-600 underline">Read it here</a>.`
          );
          setLoading(false);
          return;
        }

        const fetched = await fetchChapterPagesSmart(actualSource, chapterId);
        if (!Array.isArray(fetched) || fetched.length === 0)
          throw new Error("No pages found.");

        setPages(fetched);

        const sortedChapters = manga.chapters?.sort(
          (a, b) => parseFloat(a.chapter || "0") - parseFloat(b.chapter || "0")
        ) || [];

        const index = sortedChapters.findIndex((ch) =>
          ch.candidates?.some((c) => c.chapterId === chapterId)
        );

        setPrevChapterId(sortedChapters[index - 1]?.candidates?.[0]?.chapterId || null);
        setNextChapterId(sortedChapters[index + 1]?.candidates?.[0]?.chapterId || null);

      } catch (err: any) {
        setError(err?.message || "Failed to load chapter pages.");
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, [chapterId, routeSource, manga]);

  if (!manga)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium mb-3">
          ⚠️ Manga data missing. Please go back.
        </p>
        <button onClick={() => navigate(-1)} className="text-blue-500 underline">
          ← Go Back
        </button>
      </div>
    );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="animate-pulse text-gray-600 text-lg">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <div
          className="text-red-500 mb-4"
          dangerouslySetInnerHTML={{ __html: error }}
        />
        <button onClick={() => navigate(-1)} className="text-blue-500 underline">
          ← Go Back
        </button>
      </div>
    );

  return (
    <div className="p-4 flex flex-col items-center bg-gray-50 min-h-screen">

      {/* ✅ ADS TOP CENTERED */}
      <div className="w-full flex justify-center mb-4">
        <Ads />
      </div>

      {/* Header */}
      <div className="self-start mb-4 flex gap-4 items-center">
        <button onClick={() => navigate(-1)} className="text-blue-500 underline">
          ← Back
        </button>
        <Link
          to={`/manga/${manga.id}`}
          className="text-blue-500 underline font-medium"
        >
          {manga.title}
        </Link>
      </div>

      {/* Pages */}
      {pages.map((url, i) => (
        <img
          key={i}
          src={url}
          className="mb-4 w-full max-w-2xl rounded-lg shadow"
          loading="lazy"
        />
      ))}

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        {prevChapterId && (
          <button
            onClick={() =>
              navigate(`/manga/${manga.id}/chapter/${routeSource}/${prevChapterId}`)
            }
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Previous
          </button>
        )}
        {nextChapterId && (
          <button
            onClick={() =>
              navigate(`/manga/${manga.id}/chapter/${routeSource}/${nextChapterId}`)
            }
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default ChapterReader;
