import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { startOfflineSync } from "@/lib/offline/connectivity";
import { useOfflineQueue } from "@/lib/offline/queue";
import { useEmailConfirmation } from "@/stores/emailConfirmation";
import { usePreferences } from "@/stores/preferences";
import "@/styles/globals.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root container in index.html");
}

void usePreferences.hydrate();
void useEmailConfirmation.hydrate();
void useOfflineQueue.hydrate().then(startOfflineSync);

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
