import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { captureAttribution, flushOutbox } from "./lib/relay";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Remember which campaign link brought the visitor, and resend any form saved while offline.
captureAttribution();
addEventListener("load", () => void flushOutbox());
addEventListener("online", () => void flushOutbox());

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}
