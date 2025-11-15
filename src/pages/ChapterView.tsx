import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchChapterPagesMulti } from "../api/mangaAPI";
import { useManga } from "../context/MangaContext";
import Ads from "../components/Ads"; // ✅ ADD THIS

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

const ChapterView: React.FC = () => {
  const { manga } = useManga();
  const navigate = useNavigate();
  const { source = "mangadex", chapterId, mangaId } = useParams<{
    source?: string;
    chapterId?: string;
    mangaId?: string;
  }>();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);

  // Load settings
  const [readingDirection, setReadingDirection] = useState<"ltr" | "rtl">("ltr");
  const [imageQuality, setImageQuality] = useState<"low" | "medium" | "high">("medium");
  const [autoScroll, setAutoScroll] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReadingDirection(localStorage.getItem("readingDirection") as any || "ltr");
    setImageQuality(localStorage.getItem("imageQuality") as any || "medium");
    setAutoScroll(localStorage.getItem("autoScroll") === "true");
    setNotifications(localStorage.getItem("notifications") !== "false");
  }, []);

  const sortChapters = useCallback((chapters: Chapter[]) => {
    return [...chapters].sort((a, b) => {
      const aNum = parseFloat(a.chapter || "0");
      const bNum = parseFloat(b.chapter || "0");
      if (aNum !== bNum) return aNum - bNum;
      return (a.chapter || "").localeCompare(b.chapter || "");
    });
  }, []);

  // Load pages
  const loadChapter = useCallback(async () => {
    if (!chapterId || !source) {
      setError("Invalid chapter parameters.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const fetchedImages = await fetchChapterPagesMulti(source, chapterId, imageQuality);

      if (!fetchedImages?.length) {
        setError("No pages found for this chapter.");
        return;
      }

      setImages(fetchedImages);

      if (manga?.chapters?.length) {
        const sorted = sortChapters(manga.chapters);
        const idx = sorted.findIndex((ch) =>
          ch.candidates?.some((c) => c.chapterId === chapterId)
        );

        const prev = sorted[idx - 1];
        const next = sorted[idx + 1];
        setPrevChapterId(prev?.candidates?.[0]?.chapterId || null);
        setNextChapterId(next?.candidates?.[0]?.chapterId || null);
      }
    } catch (err) {
      setError("Failed to load chapter pages.");
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  }, [chapterId, source, manga, sortChapters, imageQuality]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  // Auto scroll
  useEffect(() => {
    if (autoScroll && images.length > 0) {
      autoScrollRef.current = setInterval(() => {
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      }, 5000);
    } else if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [autoScroll, images]);

  const handlePrev = () => {
    if (prevChapterId) navigate(`/chapter/${source}/${prevChapterId}/${mangaId || manga?.id}`);
  };

  const handleNext = () => {
    if (nextChapterId) navigate(`/chapter/${source}/${nextChapterId}/${mangaId || manga?.id}`);
  };

  const displayedImages =
    readingDirection === "rtl" ? [...images].reverse() : images;

  if (loading)
    return <p className="text-center mt-10 text-blue-500">Loading chapter...</p>;

  if (error)
    return (
      <div className="flex flex-col items-center mt-10">
        <p className="text-red-500 mb-3">{error}</p>
        <button onClick={() => navigate(-1)} className="text-blue-500 underline">
          ← Go Back
        </button>
      </div>
    );

  return (
    <div
      ref={containerRef}
      dir={readingDirection}
      className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 min-h-screen"
    >
      {/* Reader Settings */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Direction: {readingDirection} | Quality: {imageQuality} | Auto-scroll:{" "}
        {autoScroll ? "On" : "Off"}
      </div>

      {/* ✅ BANNER AD — ADSTERRA */}
      <Ads />

      {/* Pages */}
      {displayedImages.map((img, idx) => (
        <img
          key={idx}
          src={img}
          className="max-w-full mb-4 rounded shadow"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) =>
            ((e.target as HTMLImageElement).src = "https://i.imgur.com/0KFBHTB.png")
          }
        />
      ))}

      {/* Prev Next Buttons */}
      <div className="mt-6 w-full flex justify-between px-4 pb-24">
        <button
          disabled={!prevChapterId}
          onClick={handlePrev}
          className={`flex-1 mx-1 py-2 rounded-lg text-sm font-medium ${
            prevChapterId
              ? "bg-gray-700 text-white hover:bg-gray-800"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
        >
          ← Previous
        </button>

        <button
          disabled={!nextChapterId}
          onClick={handleNext}
          className={`flex-1 mx-1 py-2 rounded-lg text-sm font-medium ${
            nextChapterId
              ? "bg-lime-500 text-white hover:bg-lime-600"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ChapterView;
