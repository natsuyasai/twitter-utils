import { getSettings } from "../../shared/settings";

let enabledUrls: string[] = [];

/**
 * 設定を読み込む
 */
async function loadSettings() {
  const settings = await getSettings();
  enabledUrls = settings.areaRemove.enabledUrls;
}

/**
 * 有効なURLか
 */
export function isEnableURL() {
  return enabledUrls.some((url) => location.href.indexOf(url) >= 0);
}

/**
 * アクティブなタブ名を取得
 * @returns
 */
export function getActiveTabName() {
  if (!isEnableURL()) {
    return null;
  }
  const tab = document.getElementsByTagName("a");
  for (let i = 0; i < tab.length; i++) {
    const elem = tab[i];
    const isTab =
      elem.hasAttribute("role") && elem.getAttribute("role") === "tab";
    if (!isTab) {
      continue;
    }
    const isSelectedTabElement =
      elem.hasAttribute("aria-selected") &&
      elem.getAttribute("aria-selected") === "true";
    if (!isSelectedTabElement) {
      continue;
    }
    const tabName = getTabName(elem.children);
    return tabName;
  }
  return null;
}

/**
 * @param {HTMLCollection} children
 */
function getTabName(children: HTMLCollection): string | null {
  for (const child of children) {
    if (child.tagName.toLowerCase() === "span") {
      return child.textContent;
    }
  }
  for (const child of children) {
    const text = getTabName(child.children);
    if (text !== null) {
      return text;
    }
  }
  return null;
}

/**
 * tabs.tsの初期化
 */
export async function initializeTabs() {
  await loadSettings();
}
