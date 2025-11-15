import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { MangaSummary } from "../types";

export default function MangaCard({
  manga,
  onClick,
}: {
  manga?: MangaSummary;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  if (!manga || !manga.title) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Missing manga data
      </div>
    );
  }

  // 🔍 Check favorite status
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("manga:favorites") || "[]");
    setIsFavorite(favs.some((f: MangaSummary) => f.id === manga.id));
  }, [manga.id]);

  // ❤️ Toggle favorite with toast
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem("manga:favorites") || "[]");
    let updated;

    if (isFavorite) {
      updated = favs.filter((f: MangaSummary) => f.id !== manga.id);
      toast.error(`Removed from Favorites`, {
        style: { background: "#1f2937", color: "#fff" },
        icon: "💔",
      });
    } else {
      updated = [...favs, manga];
      toast.success(`Added to Favorites`, {
        style: { background: "#1f2937", color: "#fff" },
        icon: "❤️",
      });
    }

    localStorage.setItem("manga:favorites", JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else if (manga?.id) {
      navigate(`/manga/${manga.id}?source=${manga.source || "mangadex"}`);
    }
  };

  const cover =
    manga.cover || "https://i.imgur.com/0KFBHTB.png";
  const title = manga.title || "Untitled Manga";
  const latestChapter = manga.latestChapter || "?";

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg bg-white dark:bg-gray-900 transition-all duration-300"
    >
      {/* 🖼 Cover with gradient overlay */}
      <div className="relative w-full aspect-[3/4]">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://i.imgur.com/0KFBHTB.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70 transition-opacity group-hover:opacity-80 rounded-2xl"></div>

        {/* ❤️ Favorite Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={toggleFavorite}
          className={`absolute bottom-3 right-3 z-20 px-2.5 py-1.5 text-sm font-medium rounded-full shadow-md transition-all duration-200 ${
            isFavorite
              ? "bg-pink-500 text-white hover:bg-pink-600"
              : "bg-white/80 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isFavorite ? "❤️" : "🤍"}
        </motion.button>
      </div>

      {/* 📖 Text content overlay */}
      <div className="absolute bottom-3 left-3 right-10 z-10">
        <h3 className="text-sm font-semibold text-white drop-shadow-md truncate">
          {title}
        </h3>
        <p className="text-xs text-gray-200 mt-0.5">
          Chapter {latestChapter}
        </p>
      </div>
    </motion.div>
  );
}
