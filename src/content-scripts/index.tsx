import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "./App";
import { initializeImageSizeChanger } from "./image-size/ImageSizeChanger";
import { initializeAreaRemove } from "./area-remove/AreaRemove";
import { loadDefaultInterval } from "./auto-reload/storage";
import { initializeImagePopup } from "./image-popup/ImagePopupManager";
import { initializeTabSwitcher } from "./tab-switcher/TabSwitcher";
import { initializeTabs } from "./utlis/tabs";
import "./tab-initializer/TabInitializer";

const initialize = async () => {
  await initializeTabs();
  await initializeAreaRemove();
  await initializeImageSizeChanger();
  await loadDefaultInterval();
  await initializeImagePopup();
  await initializeTabSwitcher();
};

initialize();

const rootEl: HTMLElement = document.createElement("div");
document.body.insertBefore(rootEl, document.body.firstElementChild);

const root: Root = createRoot(rootEl);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
