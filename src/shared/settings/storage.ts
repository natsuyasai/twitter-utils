import type { AppSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const SETTINGS_KEY = "twitter-utils-settings";

/**
 * Chrome Storage APIから設定を取得
 */
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const result = await chrome.storage.sync.get(SETTINGS_KEY);
    if (result[SETTINGS_KEY]) {
      // 保存された設定とデフォルト設定をマージ（新しい設定項目に対応）
      return {
        ...DEFAULT_SETTINGS,
        ...result[SETTINGS_KEY],
      };
    }
  } catch (error) {
    console.error("Failed to load settings from chrome.storage:", error);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Chrome Storage APIに設定を保存
 */
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
  } catch (error) {
    console.error("Failed to save settings to chrome.storage:", error);
    throw error;
  }
};

/**
 * 設定の一部を更新
 */
export const updateSettings = async (
  partial: Partial<AppSettings>
): Promise<void> => {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
};

/**
 * 設定変更を監視
 */
export const onSettingsChange = (
  callback: (settings: AppSettings) => void
): (() => void) => {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === "sync" && changes[SETTINGS_KEY]) {
      callback(changes[SETTINGS_KEY].newValue);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // クリーンアップ関数を返す
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};
