import { useEffect } from "react";

const Ads = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//www.highperformanceformat.com/5c7cd688944408f7b4688a2ed2eaa23f/invoke.js";
    script.async = true;

    const atOptions = {
      key: "5c7cd688944408f7b4688a2ed2eaa23f",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    // Inject global variable
    // @ts-ignore
    window.atOptions = atOptions;

    document.getElementById("ad-container")?.appendChild(script);
  }, []);

  return (
    <div
      id="ad-container"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        margin: "10px 0",
      }}
    ></div>
  );
};

export default Ads;
