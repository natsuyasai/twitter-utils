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

// ヘッダーカスタマイザー設定
export interface HeaderCustomizerSettings {
  visibleLinks: string[]; // 表示するリンクのラベル
}

// 個別機能の有効/無効設定
export interface FeatureToggles {
  autoReload: boolean; // 自動リロード
  imageSize: boolean; // 画像サイズ変更
  areaRemove: boolean; // エリア削除
  imagePopup: boolean; // 画像ポップアップ
  tabSwitcher: boolean; // タブスイッチャー
  scrollRestore: boolean; // スクロール位置復元
  headerCustomizer: boolean; // ヘッダーカスタマイザー
}

// 全体の設定
export interface AppSettings {
  enabled: boolean; // 全機能の有効/無効
  features: FeatureToggles; // 個別機能の有効/無効
  areaRemove: AreaRemoveSettings;
  intervalTimer: IntervalTimerSettings;
  imageSize: ImageSizeSettings;
  imageLink: ImageLinkSettings;
  tabSwitcher: TabSwitcherSettings;
  headerCustomizer: HeaderCustomizerSettings;
}

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  enabled: true, // デフォルトは全機能有効
  features: {
    autoReload: true,
    imageSize: true,
    areaRemove: true,
    imagePopup: true,
    tabSwitcher: true,
    scrollRestore: true,
    headerCustomizer: true,
  },
  areaRemove: {
    enabledUrls: [
      "https://x.com/",
      "https://x.com/home",
      "https://x.com/notifications",
      "/photo/",
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
  headerCustomizer: {
    visibleLinks: [
      "ホーム",
      "調べたいものを検索",
      "通知",
      "ダイレクトメッセージ",
      "リスト",
      "ブックマーク",
      "コミュニティ",
      "プロフィール",
      "ポストする",
    ],
  },
};
