/**
 * 設定データの型定義
 */

// エリア削除設定
export interface AreaRemoveSettings {
  enabledUrls: string[];
  enabledTabs: string[];
}

// インターバルタイマー設定
export interface IntervalTimerSettings {
  defaultIntervalIndex: number; // INTERVAL_OPTIONSのインデックス
}

// 画像サイズ設定
export interface ImageSizeSettings {
  imageWidth: string; // 例: "100px", "200px"
}

// 画像リンク設定
export interface ImageLinkSettings {
  openInIframe: boolean;
}

// タブスイッチャー設定
export interface TabSwitcherSettings {
  enabled: boolean;
  swipeThreshold: number; // スワイプの最小移動距離（px）
}

// 全体の設定
export interface AppSettings {
  areaRemove: AreaRemoveSettings;
  intervalTimer: IntervalTimerSettings;
  imageSize: ImageSizeSettings;
  imageLink: ImageLinkSettings;
  tabSwitcher: TabSwitcherSettings;
}

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  areaRemove: {
    enabledUrls: [
      "https://x.com/",
      "https://x.com/home",
      "https://x.com/notifications",
    ],
    enabledTabs: ["フォロー中", "main"],
  },
  intervalTimer: {
    defaultIntervalIndex: 8, // 5分
  },
  imageSize: {
    imageWidth: "100px",
  },
  imageLink: {
    openInIframe: false,
  },
  tabSwitcher: {
    enabled: true,
    swipeThreshold: 100, // 100px
  },
};
