import { getActiveTabName } from "../utlis/tabs";
import { getSettings } from "../../shared/settings";

let enabledUrls: string[] = [];
let enabledTabs: string[] = [];

/**
 * 設定を読み込む
 */
async function loadSettings() {
  const settings = await getSettings();
  enabledUrls = settings.areaRemove.enabledUrls;
  enabledTabs = settings.areaRemove.enabledTabs;
}

/**
 * 有効なURLか
 */
function isEnableURL() {
  return enabledUrls.some((url) => location.href.indexOf(url) >= 0);
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

/**
 * 入力欄表示状態更新
 */
function changeTweetInputVisibility() {
  // プログレスバー指定の要素が入力部分しかないため、
  // プログレスバーを探して、その親の表示状態を切り替える
  const divs = document.getElementsByTagName("div");
  let progressbar = null;
  for (let index = 0; index < divs.length; index++) {
    const element = divs[index];
    if (element.role !== "progressbar") {
      continue;
    }
    progressbar = element;
    break;
  }
  if (progressbar === null) {
    return;
  }
  // プログレスバーの兄弟要素にツイート入力欄があるか確認
  if (!isTweetArea(progressbar)) {
    return;
  }
  const inputRootElement = progressbar.parentElement;
  if (inputRootElement === null) {
    return;
  }
  if (isEnableTab()) {
    inputRootElement.style.display = "initial";
  } else {
    inputRootElement.style.display = "none";
  }
}

function isTweetArea(element: HTMLElement) {
  return (
    element.nextElementSibling?.querySelector(
      "div[data-testid*='tweetTextarea']"
    ) !== null
  );
}

/**
 * サイドバー表示状態更新
 */
function changeSidebarVisibility() {
  const header = document.getElementsByTagName("header");
  let sidebarElement = null;
  for (let index = 0; index < header.length; index++) {
    const element = header[index];
    if (element.role !== "banner") {
      continue;
    }
    sidebarElement = element;
    break;
  }
  if (sidebarElement === null) {
    return;
  }
  if (isEnableTab()) {
    sidebarElement.style.display = "initial";
  } else {
    sidebarElement.style.display = "none";
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
