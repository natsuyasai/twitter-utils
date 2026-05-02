export interface IntervalOption {
  value: number;
  label: string;
  seconds: number;
}

export const INTERVAL_OPTIONS: IntervalOption[] = [
  { value: 0, label: "5秒", seconds: 5 },
  { value: 1, label: "10秒", seconds: 10 },
  { value: 2, label: "15秒", seconds: 15 },
  { value: 3, label: "30秒", seconds: 30 },
  { value: 4, label: "45秒", seconds: 45 },
  { value: 5, label: "1分", seconds: 60 },
  { value: 6, label: "2分", seconds: 120 },
  { value: 7, label: "3分", seconds: 180 },
  { value: 8, label: "5分", seconds: 300 },
  { value: 9, label: "10分", seconds: 600 },
  { value: 10, label: "15分", seconds: 900 },
  { value: 11, label: "30分", seconds: 1800 },
];

export const DEFAULT_INTERVAL = 300; // 5分

// フォロー中タブの更新に必要な最小インターバル（秒）
export const FOLLOWING_TAB_MIN_INTERVAL_SEC = 61;
// 1分に相当するオプションの value（これ未満のオプションはフォロー中タブ選択中に無効化）
export const FOLLOWING_TAB_MIN_OPTION_VALUE = 5;
