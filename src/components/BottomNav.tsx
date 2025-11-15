import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, Settings } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();

  const items = [
    { path: "/", icon: <Home size={20} />, label: "Home" },
    { path: "/search", icon: <Search size={20} />, label: "Search" },
    { path: "/favorites", icon: <Heart size={20} />, label: "Favs" },
    { path: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-700 backdrop-blur-md md:hidden">
      <ul className="flex justify-around items-center py-2 text-gray-600 dark:text-gray-300 text-xs">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex flex-col items-center ${
                location.pathname === item.path
                  ? "text-indigo-600"
                  : "hover:text-indigo-400"
              }`}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
