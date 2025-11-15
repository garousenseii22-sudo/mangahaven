import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, Settings } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/70 dark:border-gray-800 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          MangaHaven
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
          <Link
            to="/"
            className={`hover:text-indigo-600 ${
              location.pathname === "/" ? "text-indigo-600 font-medium" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={`hover:text-indigo-600 ${
              location.pathname === "/search" ? "text-indigo-600 font-medium" : ""
            }`}
          >
            Search
          </Link>
          <Link
            to="/favorites"
            className={`hover:text-indigo-600 ${
              location.pathname === "/favorites" ? "text-indigo-600 font-medium" : ""
            }`}
          >
            Favorites
          </Link>
          <Link
            to="/settings"
            className={`hover:text-indigo-600 ${
              location.pathname === "/settings" ? "text-indigo-600 font-medium" : ""
            }`}
          >
            Settings
          </Link>
        </div>
      </nav>
    </header>
  );
}
