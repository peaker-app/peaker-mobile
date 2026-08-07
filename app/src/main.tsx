import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { useEmailConfirmation } from "@/stores/emailConfirmation";
import { usePreferences } from "@/stores/preferences";
import "@/styles/globals.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root container in index.html");
}

void usePreferences.hydrate();
void useEmailConfirmation.hydrate();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
