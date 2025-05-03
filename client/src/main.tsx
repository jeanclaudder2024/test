import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Add Leaflet CSS for maps
const leafletCss = document.createElement("link");
leafletCss.rel = "stylesheet";
leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
leafletCss.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
leafletCss.crossOrigin = "";
document.head.appendChild(leafletCss);

// Add page title
const titleElement = document.createElement("title");
titleElement.textContent = "Vesselian | Smart Fleet Management Platform";
document.head.appendChild(titleElement);

// Add favicon
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚢</text></svg>";
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(<App />);
