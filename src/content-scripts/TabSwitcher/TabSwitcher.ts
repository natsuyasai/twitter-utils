import { getSettings } from "../../shared/settings";
import styles from "./TabSwitcher.module.scss";

let isEnabled = false;
let swipeThreshold = 100;
let startX = 0;
let startY = 0;
let startTime = 0;
let indicatorElement: HTMLElement | null = null;
let progressBar: HTMLElement | null = null;
let arrow: HTMLElement | null = null;
let label: HTMLElement | null = null;

/**
 * 設定を読み込む
 */
async function loadSettings() {
  const settings = await getSettings();
  isEnabled = settings.tabSwitcher.enabled;
  swipeThreshold = settings.tabSwitcher.swipeThreshold;
}

/**
 * 有効なURLか
 */
function isEnableURL() {
  return (
    location.href === "https://x.com/" ||
    location.href.indexOf("https://x.com/home") >= 0 ||
    location.href.indexOf("https://x.com/notifications") >= 0
  );
}

/**
 * スワイプインジケーターを作成
 */
function createIndicator() {
  if (indicatorElement) return;

  indicatorElement = document.createElement("div");
  indicatorElement.className = styles.swipeIndicator;

  arrow = document.createElement("div");
  arrow.className = styles.arrow;
  arrow.textContent = "→";

  const progressContainer = document.createElement("div");
  progressContainer.className = styles.progress;

  progressBar = document.createElement("div");
  progressBar.className = styles.progressBar;
  progressBar.style.width = "0%";

  progressContainer.appendChild(progressBar);

  label = document.createElement("div");
  label.className = styles.label;
  label.textContent = "";

  indicatorElement.appendChild(arrow);
  indicatorElement.appendChild(progressContainer);
  indicatorElement.appendChild(label);

  document.body.appendChild(indicatorElement);
}

/**
 * スワイプインジケーターを表示
 */
function showIndicator() {
  if (!indicatorElement) return;
  indicatorElement.classList.add(styles.active);
}

/**
 * スワイプインジケーターを非表示
 */
function hideIndicator() {
  if (!indicatorElement) return;
  indicatorElement.classList.remove(styles.active);
}

/**
 * スワイプの進行状況を更新
 */
function updateIndicator(diffX: number) {
  if (!progressBar || !arrow || !label) return;

  const absDistance = Math.abs(diffX);
  const progress = Math.min((absDistance / swipeThreshold) * 100, 100);

  progressBar.style.width = `${progress}%`;

  if (diffX > 0) {
    // 右スワイプ
    arrow.textContent = "←";
    label.textContent = "前のタブ";
  } else {
    // 左スワイプ
    arrow.textContent = "→";
    label.textContent = "次のタブ";
  }
}

/**
 * 要素が表示されているか判定
 */
function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

/**
 * すべてのタブ要素を取得
 */
function getAllTabElements(): HTMLAnchorElement[] {
  const tabs: HTMLAnchorElement[] = [];
  const allLinks = document.getElementsByTagName("a");

  for (let i = 0; i < allLinks.length; i++) {
    const elem = allLinks[i];
    const isTab =
      elem.hasAttribute("role") && elem.getAttribute("role") === "tab";
    if (isTab) {
      tabs.push(elem);
    }
  }

  return tabs;
}

/**
 * 表示されているタブ要素のみを取得
 */
function getVisibleTabElements(): HTMLAnchorElement[] {
  const allTabs = getAllTabElements();
  return allTabs.filter((tab) => isElementVisible(tab));
}

/**
 * アクティブなタブのインデックスを取得（表示されているタブの中で）
 */
function getActiveTabIndex(): number {
  const tabs = getVisibleTabElements();

  for (let i = 0; i < tabs.length; i++) {
    const elem = tabs[i];
    const isSelected =
      elem.hasAttribute("aria-selected") &&
      elem.getAttribute("aria-selected") === "true";
    if (isSelected) {
      return i;
    }
  }

  return -1;
}

/**
 * 指定したインデックスのタブに切り替え（表示されているタブの中で）
 */
function switchToTab(index: number) {
  const tabs = getVisibleTabElements();
  if (index >= 0 && index < tabs.length) {
    tabs[index].click();
  }
}

/**
 * 次のタブに移動
 */
function switchToNextTab() {
  const currentIndex = getActiveTabIndex();
  if (currentIndex === -1) return;

  const tabs = getVisibleTabElements();
  // 一番右のタブの場合は移動しない
  if (currentIndex >= tabs.length - 1) return;

  const nextIndex = currentIndex + 1;
  switchToTab(nextIndex);
}

/**
 * 前のタブに移動
 */
function switchToPreviousTab() {
  const currentIndex = getActiveTabIndex();
  if (currentIndex === -1) return;

  // 一番左のタブの場合は移動しない
  if (currentIndex <= 0) return;

  const prevIndex = currentIndex - 1;
  switchToTab(prevIndex);
}

/**
 * タッチ開始イベント
 */
function handleTouchStart(e: TouchEvent) {
  if (!isEnabled || !isEnableURL()) return;

  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  startTime = Date.now();
}

/**
 * タッチ移動イベント
 */
function handleTouchMove(e: TouchEvent) {
  if (!isEnabled || !isEnableURL()) return;
  if (startX === 0) return;

  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const diffX = currentX - startX;
  const diffY = currentY - startY;

  // 垂直方向の移動が大きい場合は無視
  if (Math.abs(diffY) > Math.abs(diffX)) return;

  // インジケーターを表示して更新
  showIndicator();
  updateIndicator(diffX);
}

/**
 * タッチ終了イベント
 */
function handleTouchEnd(e: TouchEvent) {
  if (!isEnabled || !isEnableURL()) return;

  // インジケーターを非表示
  hideIndicator();

  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  const endTime = Date.now();

  const diffX = endX - startX;
  const diffY = endY - startY;
  const diffTime = endTime - startTime;

  // リセット
  startX = 0;
  startY = 0;

  // 垂直方向の移動が大きい場合はスワイプとみなさない
  if (Math.abs(diffY) > Math.abs(diffX)) return;

  // スワイプが速すぎる場合は無視（誤検知防止）
  if (diffTime < 50) return;

  // スワイプが遅すぎる場合は無視
  if (diffTime > 1000) return;

  // 閾値を超えた場合のみスワイプと判定
  if (Math.abs(diffX) >= swipeThreshold) {
    if (diffX > 0) {
      // 右スワイプ → 前のタブ
      switchToPreviousTab();
    } else {
      // 左スワイプ → 次のタブ
      switchToNextTab();
    }
  }
}

/**
 * マウス開始イベント（デスクトップ用）
 */
function handleMouseDown(e: MouseEvent) {
  if (!isEnabled || !isEnableURL()) return;

  startX = e.clientX;
  startY = e.clientY;
  startTime = Date.now();
}

/**
 * マウス移動イベント（デスクトップ用）
 */
function handleMouseMove(e: MouseEvent) {
  if (!isEnabled || !isEnableURL()) return;
  if (startX === 0) return;

  const currentX = e.clientX;
  const currentY = e.clientY;
  const diffX = currentX - startX;
  const diffY = currentY - startY;

  // 垂直方向の移動が大きい場合は無視
  if (Math.abs(diffY) > Math.abs(diffX)) return;

  // インジケーターを表示して更新
  showIndicator();
  updateIndicator(diffX);
}

/**
 * マウス終了イベント（デスクトップ用）
 */
function handleMouseUp(e: MouseEvent) {
  if (!isEnabled || !isEnableURL()) return;

  // インジケーターを非表示
  hideIndicator();

  const endX = e.clientX;
  const endY = e.clientY;
  const endTime = Date.now();

  const diffX = endX - startX;
  const diffY = endY - startY;
  const diffTime = endTime - startTime;

  // リセット
  startX = 0;
  startY = 0;

  // 垂直方向の移動が大きい場合はスワイプとみなさない
  if (Math.abs(diffY) > Math.abs(diffX)) return;

  // スワイプが速すぎる場合は無視（誤検知防止）
  if (diffTime < 50) return;

  // スワイプが遅すぎる場合は無視
  if (diffTime > 1000) return;

  // 閾値を超えた場合のみスワイプと判定
  if (Math.abs(diffX) >= swipeThreshold) {
    if (diffX > 0) {
      // 右スワイプ → 前のタブ
      switchToPreviousTab();
    } else {
      // 左スワイプ → 次のタブ
      switchToNextTab();
    }
  }
}

/**
 * 初期化
 */
export async function initializeTabSwitcher() {
  await loadSettings();

  if (!isEnabled) {
    return;
  }

  // インジケーターを作成
  createIndicator();

  // タッチイベント（モバイル）
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });

  // マウスイベント（デスクトップ）
  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}
