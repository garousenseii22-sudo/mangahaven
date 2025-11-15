import React, { useState, useEffect } from "react";

export default function Settings() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [readingDirection, setReadingDirection] = useState<"ltr" | "rtl">("ltr");
  const [imageQuality, setImageQuality] = useState<"low" | "medium" | "high">("medium");
  const [autoScroll, setAutoScroll] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
    const savedDirection = localStorage.getItem("readingDirection") as "ltr" | "rtl" || "ltr";
    const savedQuality = localStorage.getItem("imageQuality") as "low" | "medium" | "high" || "medium";
    const savedAutoScroll = localStorage.getItem("autoScroll") === "true";
    const savedNotifications = localStorage.getItem("notifications") !== "false"; // Default true

    setTheme(savedTheme);
    setReadingDirection(savedDirection);
    setImageQuality(savedQuality);
    setAutoScroll(savedAutoScroll);
    setNotifications(savedNotifications);

    // Apply theme immediately
    applyTheme(savedTheme);
  }, []);

  // Function to apply theme
  const applyTheme = (newTheme: "light" | "dark") => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Save settings to localStorage and show toast
  const saveSetting = (key: string, value: string | boolean) => {
    localStorage.setItem(key, value.toString());
    setToastMessage(`${key.replace(/([A-Z])/g, " $1").toLowerCase()} updated!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle theme change
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    applyTheme(newTheme);
    saveSetting("theme", newTheme);
  };

  // Handle other settings
  const handleDirectionChange = (direction: "ltr" | "rtl") => {
    setReadingDirection(direction);
    saveSetting("readingDirection", direction);
  };

  const handleQualityChange = (quality: "low" | "medium" | "high") => {
    setImageQuality(quality);
    saveSetting("imageQuality", quality);
  };

  const handleAutoScrollToggle = () => {
    const newValue = !autoScroll;
    setAutoScroll(newValue);
    saveSetting("autoScroll", newValue);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    saveSetting("notifications", newValue);
  };

  // Clear manga cache (existing functionality)
  const clearAllMangaCache = () => {
    try {
      Object.keys(localStorage)
        .filter(
          (key) =>
            key.startsWith("mangaDex_") ||
            key.startsWith("comick_") ||
            key.startsWith("search_") ||
            key.startsWith("latestMangaDex") ||
            key.startsWith("mangadex_pages_") ||
            key.startsWith("comick_pages_")
        )
        .forEach((key) => localStorage.removeItem(key));

      // Clear in-memory cache if available
      if (
        (window as any).chapterPagesCache &&
        typeof (window as any).chapterPagesCache.clear === "function"
      ) {
        (window as any).chapterPagesCache.clear();
      }

      console.log("🧹 Manga cache cleared!");
      setToastMessage("All manga caches cleared successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error("⚠️ Failed to clear cache:", err);
      setToastMessage("Failed to clear cache. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <main className="relative p-6 min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Settings</h2>

      <div className="space-y-8">
        {/* Appearance */}
        <section>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as "light" | "dark")}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </section>

        {/* Reading Preferences */}
        <section>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Reading Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reading Direction</label>
              <select
                value={readingDirection}
                onChange={(e) => handleDirectionChange(e.target.value as "ltr" | "rtl")}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ltr">Left to Right</option>
                <option value="rtl">Right to Left</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image Quality</label>
              <select
                value={imageQuality}
                onChange={(e) => handleQualityChange(e.target.value as "low" | "medium" | "high")}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoScroll"
                checked={autoScroll}
                onChange={handleAutoScrollToggle}
                className="mr-2"
              />
              <label htmlFor="autoScroll" className="text-sm font-medium">Enable Auto-Scroll</label>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Notifications</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              checked={notifications}
              onChange={handleNotificationsToggle}
              className="mr-2"
            />
            <label htmlFor="notifications" className="text-sm font-medium">Enable Notifications</label>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={clearAllMangaCache}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              🧹 Clear Manga Cache
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">About</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
          Manga Reader App v1.0 is currently in active development. Some chapters may appear out of order, missing, or contain mixed images due to differences in third-party data sources. Our system automatically fetches manga content from public sources such as WeebCentral, MangaDex, and Atsumaru, ensuring a wide variety of available titles. If a specific chapter is unavailable or incomplete, we recommend reading it directly on the official sources mentioned above. We continuously work to improve accuracy, stability, and performance your patience and support are greatly appreciated. We are continuously working to improve performance, reliability, and reading experience. Thank you for supporting this project as it grows and improves with every update. User accounts and comments are not yet available. These features will be added in future updates as the app continues to grow. We’re continuously improving this app to enhance your manga reading experience. Features such as user registration, login, and chapter comments will be available soon. Stay tuned for updates.💖🚧

          Note: This app is still in active development. Some chapters may be incomplete or mixed. 💬
          </p>
        </section>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
          <span className="mr-2">✅</span> {toastMessage}
        </div>
      )}
    </main>
  );
}