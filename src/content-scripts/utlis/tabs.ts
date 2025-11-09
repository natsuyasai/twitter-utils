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
 * 有効なURLか
 */
function isEnableURL() {
  if (
    location.href === "https://x.com/" ||
    location.href.indexOf("https://x.com/home") >= 0 ||
    location.href.indexOf("https://x.com/notifications") >= 0
  ) {
    return true;
  } else {
    return false;
  }
}
