import { getActiveTabName } from "../utlis/tabs";

const EnableTabName = ["フォロー中", "main"];

/**
 * 有効なURLか
 */
function isEnableURL() {
  if (
    location.href === "https://x.com/" ||
    location.href.indexOf("/home") >= 0 ||
    location.href.indexOf("/notifications") >= 0
  ) {
    return true;
  } else {
    return false;
  }
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
  if (EnableTabName.some((name) => name === tabName)) {
    return true;
  }
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
  let inputRootElement = null;
  for (let index = 0; index < divs.length; index++) {
    const element = divs[index];
    if (element.role !== "progressbar") {
      continue;
    }
    inputRootElement = element.parentElement;
    break;
  }
  if (inputRootElement === null) {
    return;
  }
  if (isEnableTab()) {
    inputRootElement.style.display = "initial";
  } else {
    inputRootElement.style.display = "none";
  }
}

/**
 * サイドバー表示状態更新
 */
function changeSidebarVisibility() {
  // プログレスバー指定の要素が入力部分しかないため、
  // プログレスバーを探して、その親の表示状態を切り替える
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

export function initializeAreaRemove() {
  changeTweetInputVisibility();
  changeSidebarVisibility();
  watchURLChange();
}
