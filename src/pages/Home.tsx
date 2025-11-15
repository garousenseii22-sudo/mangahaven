import { useEffect, useState } from "react";
import { fetchLatestManga } from "../api/mangaAPI";
import MangaCard from "../components/MangaCard";
import { motion } from "framer-motion";
import ResponsiveAds from "../components/ResponsiveAds"; // ✅ Updated AD Component

const Home = () => {
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManga = async () => {
      try {
        const data = await fetchLatestManga();
        if (Array.isArray(data)) setMangaList(data);
        else setMangaList([]);
      } catch (err) {
        console.error("Error fetching latest manga:", err);
        setMangaList([]);
      } finally {
        setLoading(false);
      }
    };

    loadManga();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Last Updated
      </h2>

      {/* ✅ RESPONSIVE BANNER AD */}
      <div className="mb-6 flex justify-center">
        <ResponsiveAds />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse aspect-[3/4]"
            />
          ))}
        </div>
      ) : mangaList.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No manga found. Try refreshing.
        </p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"
        >
          {mangaList.map((manga) => (
            <motion.div
              key={manga.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MangaCard manga={manga} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Home;
