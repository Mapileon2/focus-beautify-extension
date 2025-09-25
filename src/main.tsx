import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle initial routing for extension pages
const rootElement = document.getElementById("root")!;
const initialRoute = rootElement.getAttribute("data-route");

// Set hash route based on data-route attribute
if (initialRoute && !window.location.hash) {
  window.location.hash = `#/${initialRoute}`;
}

createRoot(rootElement).render(<App />);
