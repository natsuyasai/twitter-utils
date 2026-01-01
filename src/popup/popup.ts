import { getSettings, saveSettings } from "../shared/settings";

/**
 * タブをリロードする
 */
async function reloadActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (tabs[0]?.id) {
    chrome.tabs.reload(tabs[0].id);
  }
}

/**
 * ポップアップの初期化
 */
async function initializePopup() {
  const enableToggle = document.getElementById(
    "enableToggle"
  ) as HTMLInputElement;
  const settingsButton = document.getElementById(
    "settingsButton"
  ) as HTMLButtonElement;

  if (!enableToggle || !settingsButton) {
    console.error("[Popup] Required elements not found");
    return;
  }

  // 現在の設定を読み込む
  const settings = await getSettings();
  enableToggle.checked = settings.enabled;

  // 全機能トグルスイッチの変更を監視
  enableToggle.addEventListener("change", async () => {
    const newSettings = {
      ...settings,
      enabled: enableToggle.checked,
    };

    await saveSettings(newSettings);
    console.log(
      `[Popup] Extension ${enableToggle.checked ? "enabled" : "disabled"}`
    );

    await reloadActiveTab();
  });

  // 設定ボタンのクリックイベント
  settingsButton.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}

// DOM読み込み完了後に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePopup);
} else {
  initializePopup();
}
