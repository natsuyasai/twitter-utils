import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../src/setting-ui/index.css";
import App from "../../src/setting-ui/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
