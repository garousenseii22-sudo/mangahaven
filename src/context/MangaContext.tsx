import React, { createContext, useContext, useState, useEffect } from "react";

interface Manga {
  id: string;
  source?: string;
  title: string;
  description?: string;
  cover: string;
  author?: string;
  status?: string;
  chapters?: any[];
}

interface MangaContextType {
  manga: Manga | null;
  setManga: (manga: Manga | null) => void;
}

const MangaContext = createContext<MangaContextType | undefined>(undefined);

export const MangaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manga, setManga] = useState<Manga | null>(null);

  // ✅ Load saved manga from localStorage when app starts
  useEffect(() => {
    const saved = localStorage.getItem("manga");
    if (saved) {
      try {
        setManga(JSON.parse(saved));
      } catch {
        console.warn("⚠ Failed to parse saved manga from localStorage");
      }
    }
  }, []);

  // ✅ Save manga whenever it changes
  useEffect(() => {
    if (manga) localStorage.setItem("manga", JSON.stringify(manga));
    else localStorage.removeItem("manga");
  }, [manga]);

  return (
    <MangaContext.Provider value={{ manga, setManga }}>
      {children}
    </MangaContext.Provider>
  );
};

export const useManga = () => {
  const ctx = useContext(MangaContext);
  if (!ctx) throw new Error("useManga must be used inside a MangaProvider");
  return ctx;
};
