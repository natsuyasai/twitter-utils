import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "./App";

const rootEl: HTMLElement = document.createElement("div");
document.body.insertBefore(rootEl, document.body.firstElementChild);

const root: Root = createRoot(rootEl);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
