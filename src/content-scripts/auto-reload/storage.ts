import { getActiveTabName } from "../utlis/tabs";

export interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY_POSITION = "auto-reload-position";
const STORAGE_KEY_INTERVAL = "auto-reload-interval";
const DEFAULT_POSITION: Position = { x: 0, y: 40 };
const DEFAULT_INTERVAL_INDEX = 8; // 5分のインデックス

// タブ名を含めたストレージキーを生成
const getIntervalStorageKey = (): string => {
  const tabName = getActiveTabName();
  return tabName ? `${STORAGE_KEY_INTERVAL}-${tabName}` : STORAGE_KEY_INTERVAL;
};

// localStorageから位置を取得
export const getStoredPosition = (): Position => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_POSITION);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load position from localStorage:", error);
  }
  return DEFAULT_POSITION;
};

// localStorageに位置を保存
export const savePosition = (position: Position): void => {
  try {
    localStorage.setItem(STORAGE_KEY_POSITION, JSON.stringify(position));
  } catch (error) {
    console.error("Failed to save position to localStorage:", error);
  }
};

// localStorageからインターバル設定を取得
export const getStoredInterval = (maxIndex: number): number => {
  try {
    const key = getIntervalStorageKey();
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const index = parseInt(stored, 10);
      // 有効なインデックスかチェック
      if (!isNaN(index) && index >= 0 && index < maxIndex) {
        return index;
      }
    }
  } catch (error) {
    console.error("Failed to load interval from localStorage:", error);
  }
  return DEFAULT_INTERVAL_INDEX;
};

// localStorageにインターバル設定を保存
export const saveInterval = (intervalIndex: number): void => {
  try {
    const key = getIntervalStorageKey();
    localStorage.setItem(key, intervalIndex.toString());
  } catch (error) {
    console.error("Failed to save interval to localStorage:", error);
  }
};
