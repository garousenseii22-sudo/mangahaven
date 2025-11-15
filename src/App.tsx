// ✅ src/App.tsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";

// Pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import MangaDetails from "./pages/MangaDetails";
import ChapterView from "./pages/ChapterView"; // ✅ Use ChapterView instead of ChapterReader

export default function App() {
  // 🧠 Apply saved theme globally on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex-1 md:flex">
        {/* Sidebar for desktop */}
        <div className="hidden md:block w-64 p-4 border-r border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer transition">
            Home
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer transition">
            Trending
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer transition">
            Library
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />

            {/* Manga routes */}
            <Route path="/manga/:mangaId" element={<MangaDetails />} />
            <Route
              path="/chapter/:source/:chapterId/:mangaId"
              element={<ChapterView />}
            />
          </Routes>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
