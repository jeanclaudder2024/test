import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/animations.css";
import { ThemeProvider } from "./hooks/use-theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import TranslationProvider from "./i18n/TranslationProvider";

// Add Leaflet CSS for maps
const leafletCss = document.createElement("link");
leafletCss.rel = "stylesheet";
leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
leafletCss.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
leafletCss.crossOrigin = "";
document.head.appendChild(leafletCss);

// Add Google Fonts - Multiple for multilingual support
const googleFonts = document.createElement("link");
googleFonts.rel = "stylesheet";
googleFonts.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap";
document.head.appendChild(googleFonts);

// Add page title
const titleElement = document.createElement("title");
titleElement.textContent = "MyShipTracking | Enterprise Maritime Intelligence Platform";
document.head.appendChild(titleElement);

// Add favicon
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚢</text></svg>";
document.head.appendChild(favicon);

// Add meta description for SEO
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Advanced maritime intelligence platform for tracking vessels, refineries, and ports with real-time geospatial insights.";
document.head.appendChild(metaDescription);

// Add font for Arabic text
const styles = document.createElement("style");
styles.textContent = `
  /* Font configuration for different languages */
  :root {
    --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  
  /* Arabic font */
  .font-arabic {
    font-family: 'Noto Sans Arabic', var(--font-sans);
  }
  
  /* Chinese font */
  html[lang="zh"] body {
    font-family: 'Noto Sans SC', var(--font-sans);
  }
  
  /* Japanese font */
  html[lang="ja"] body {
    font-family: 'Noto Sans JP', var(--font-sans);
  }
  
  /* RTL specific styling */
  html[dir="rtl"] body {
    font-family: 'Noto Sans Arabic', var(--font-sans);
  }
`;
document.head.appendChild(styles);

createRoot(document.getElementById("root")!).render(
  <TranslationProvider>
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </TranslationProvider>
);
