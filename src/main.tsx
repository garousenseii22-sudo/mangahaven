import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; // ✅ Using HashRouter for static hosting
import App from "./App";
import "./index.css";
import { MangaProvider } from "./context/MangaContext"; // ✅ Import MangaProvider

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {/* ✅ Wrap the whole app with MangaProvider */}
      <MangaProvider>
        <App />
      </MangaProvider>
    </HashRouter>
  </React.StrictMode>
);

// ✅ Register simple service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.log("SW registration failed", err));
  });
}
