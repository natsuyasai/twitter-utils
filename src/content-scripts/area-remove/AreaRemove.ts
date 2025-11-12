import { getActiveTabName, isEnableURL } from "../utlis/tabs";
import { getSettings } from "../../shared/settings";

let enabledTabs: string[] = [];

/**
 * 設定を読み込む
 */
async function loadSettings() {
  const settings = await getSettings();
  enabledTabs = settings.areaRemove.enabledTabs;
}

/**
 * 有効なタブか
 */
function isEnableTab() {
  if (!isEnableURL()) {
    return true;
  }
  const tabName = getActiveTabName();
  if (tabName === null) {
    return false;
  }
  return enabledTabs.some((name) => name === tabName);
}

/**
 * URL変更検知
 * DOM要素の変更を検知してURLが変わったかを確認する
 */
function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  wait: number
) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: Parameters<F>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

function watchURLChange() {
  const debouncedUpdate = debounce(() => {
    changeTweetInputVisibility();
    changeSidebarVisibility();
    removeHomeTitleElement();
  }, 500);
  const observer = new MutationObserver(debouncedUpdate);
  const mainElement = document.getElementsByTagName("main");
  const config = { childList: true, subtree: true };
  if (mainElement.length > 0) {
    observer.observe(mainElement[0], config);
  } else {
    setTimeout(() => {
      watchURLChange();
    }, 1000);
  }
}

const TWEET_INPUT_STYLE_ID = "twitter-utils-tweet-input-hide";
const SIDEBAR_STYLE_ID = "twitter-utils-sidebar-hide";

/**
 * 入力欄表示状態更新
 */
function changeTweetInputVisibility() {
  const existingStyle = document.getElementById(TWEET_INPUT_STYLE_ID);

  if (isEnableTab()) {
    // タブが有効な場合はスタイルを削除
    if (existingStyle) {
      existingStyle.remove();
    }
  } else {
    // タブが無効な場合はスタイルを追加
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = TWEET_INPUT_STYLE_ID;
      style.textContent = `
        div:has(> [role="progressbar"] + * div[data-testid*="tweetTextarea"]) {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

/**
 * サイドバー表示状態更新
 */
function changeSidebarVisibility() {
  const existingStyle = document.getElementById(SIDEBAR_STYLE_ID);

  if (isEnableTab()) {
    // タブが有効な場合はスタイルを削除
    if (existingStyle) {
      existingStyle.remove();
    }
  } else {
    // タブが無効な場合はスタイルを追加
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = SIDEBAR_STYLE_ID;
      style.textContent = `
        header[role='banner'] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

function removeHomeTitleElement() {
  const h2s = document.querySelectorAll("h2");
  let homeTitleElement: HTMLElement | null = null;
  for (const h2 of h2s) {
    if (h2.innerHTML.indexOf("ホーム") < 0) {
      continue;
    }
    homeTitleElement = h2;
    break;
  }
  if (homeTitleElement === null) {
    return;
  }
  const rootElement = getElementWithNavAsSibling(homeTitleElement);
  if (rootElement === null) {
    return;
  }
  rootElement.style.display = "none";
}

function getElementWithNavAsSibling(
  element: HTMLElement | null
): HTMLElement | null {
  if (element?.nextElementSibling !== null) {
    return element;
  }
  return getElementWithNavAsSibling(element.parentElement);
}

export async function initializeAreaRemove() {
  await loadSettings();
  changeTweetInputVisibility();
  changeSidebarVisibility();
  removeHomeTitleElement();
  watchURLChange();
}
