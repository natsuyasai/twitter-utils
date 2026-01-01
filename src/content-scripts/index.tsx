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
import { getSettings } from "../shared/settings";
import { initializeScrollPositionRestore } from "./scroll-potision-restore/scrollPositionRestore";

const initialize = async () => {
  // 設定を読み込んで、全機能が有効かチェック
  const settings = await getSettings();

  if (!settings.enabled) {
    console.log("[Twitter Utils] Extension is disabled");
    return;
  }

  await initializeTabs();

  // 個別機能の有効/無効に応じて初期化
  if (settings.features.areaRemove) {
    await initializeAreaRemove();
  }

  if (settings.features.imageSize) {
    await initializeImageSizeChanger();
  }

  if (settings.features.autoReload) {
    await loadDefaultInterval();
  }

  if (settings.features.imagePopup) {
    await initializeImagePopup();
  }

  if (settings.features.tabSwitcher) {
    await initializeTabSwitcher();
  }

  if (settings.features.scrollRestore) {
    initializeScrollPositionRestore();
  }
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
