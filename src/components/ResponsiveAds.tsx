import { useEffect } from "react";

const ResponsiveAds = () => {
  useEffect(() => {
    if (document.getElementById("ads-script-hpf")) return;

    const script = document.createElement("script");
    script.id = "ads-script-hpf";
    script.src =
      "//www.highperformanceformat.com/5c7cd688944408f7b4688a2ed2eaa23f/invoke.js";
    script.async = true;

    // Desktop, Tablet, Mobile sizes
    const atOptions = {
      key: "5c7cd688944408f7b4688a2ed2eaa23f",
      format: "iframe",
      height: window.innerWidth >= 1024 ? 90 : window.innerWidth >= 768 ? 60 : 50,
      width: window.innerWidth >= 1024 ? 728 : window.innerWidth >= 768 ? 468 : 320,
      params: {},
    };

    // @ts-ignore
    window.atOptions = atOptions;

    const container = document.getElementById("ad-responsive");
    if (container) container.appendChild(script);

    return () => {
      const existing = document.getElementById("ads-script-hpf");
      if (existing) existing.remove();
    };
  }, []);

  return (
    <div
      id="ad-responsive"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        margin: "10px 0",
        minHeight: "50px",
      }}
    ></div>
  );
};

export default ResponsiveAds;
