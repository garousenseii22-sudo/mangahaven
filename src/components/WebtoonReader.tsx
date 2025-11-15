import React, { useEffect, useState, useRef } from "react";
import { fetchChapterPagesMulti } from "../api/mangaAPI";

type WebtoonReaderProps = {
  source: string; // ✅ added
  chapterId: string;
  onPrev?: () => void;
  onNext?: () => void;
  chapterTitle?: string;
};

export default function WebtoonReader({
  source,
  chapterId,
  onPrev,
  onNext,
  chapterTitle,
}: WebtoonReaderProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const cacheKey = `chapter_pages_${source}_${chapterId}`; // ✅ include source to separate caches

  useEffect(() => {
    setLoading(true);
    setError(null);

    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as string[];
        setPages(parsed);
        setLoading(false);
        return;
      } catch {
        /* ignore */
      }
    }

    let cancelled = false;
    (async () => {
      try {
        const imgs = await fetchChapterPagesMulti(source, chapterId); // ✅ fixed
        if (cancelled) return;
        setPages(imgs);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(imgs));
        } catch {}
      } catch (err: any) {
        console.error("WebtoonReader fetch error:", err);
        setError("Failed to load images");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, chapterId, cacheKey]); // ✅ include source in deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  if (loading) return <div className="p-6 text-center">Loading images...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!pages.length)
    return <div className="p-6 text-center">No pages found for this chapter.</div>;

  return (
    <div
      ref={containerRef}
      className="reader-container"
      style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}
    >
      {chapterTitle && <h2 style={{ marginBottom: 16 }}>{chapterTitle}</h2>}
      {pages.map((src, i) => (
        <div key={i} style={{ marginBottom: 28, textAlign: "center" }}>
          <img
            src={src}
            alt={`Page ${i + 1}`}
            loading="lazy"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.dataset.triedDirect !== "1") {
                img.dataset.triedDirect = "1";
                const proxyPrefix = "https://cors-manga-vercel.vercel.app/?url=";
                if (img.src.startsWith(proxyPrefix)) {
                  try {
                    const real = decodeURIComponent(
                      img.src.replace(proxyPrefix, "")
                    );
                    img.src = real;
                  } catch {
                    // ignore
                  }
                }
              }
            }}
          />
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 8,
        }}
      >
        {onPrev && <button onClick={onPrev}>Previous chapter</button>}
        {onNext && <button onClick={onNext}>Next chapter</button>}
      </div>
    </div>
  );
}
