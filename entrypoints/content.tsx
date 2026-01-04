import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "../src/content-scripts/App";
import { initializeImageSizeChanger } from "../src/content-scripts/image-size/ImageSizeChanger";
import { initializeAreaRemove } from "../src/content-scripts/area-remove/AreaRemove";
import { loadDefaultInterval } from "../src/content-scripts/auto-reload/storage";
import { initializeImagePopup } from "../src/content-scripts/image-popup/ImagePopupManager";
import { initializeTabSwitcher } from "../src/content-scripts/tab-switcher/TabSwitcher";
import { initializeTabs } from "../src/content-scripts/utlis/tabs";
import "../src/content-scripts/tab-initializer/TabInitializer";
import { getSettings } from "../src/shared/settings";
import { initializeScrollPositionRestore } from "../src/content-scripts/scroll-potision-restore/scrollPositionRestore";

// eslint-disable-next-line react-refresh/only-export-components
export default defineContentScript({
  matches: ["https://x.com/*"],
  runAt: "document_end",
  main: async () => {
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

    const rootEl: HTMLElement = document.createElement("div");
    document.body.insertBefore(rootEl, document.body.firstElementChild);

    const root: Root = createRoot(rootEl);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  },
});
