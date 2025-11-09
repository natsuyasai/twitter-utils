/**
 * スクロール状態をチェック
 */
export const isScrolling = (): boolean => {
  return document.scrollingElement ? document.scrollingElement.scrollTop > 0 : false;
};

/**
 * 実行可能なURLかチェック
 */
export const isExecutableURL = (): boolean => {
  const href = location.href;
  return (
    href === "https://x.com/" ||
    href.indexOf("https://x.com/home") >= 0 ||
    href.indexOf("https://x.com/notifications") >= 0 ||
    href.indexOf("https://x.com/search") >= 0
  );
};

/**
 * タブの再選択（メイン処理）
 */
export const reselectTab = (): void => {
  const tabs = document.getElementsByTagName("a");
  for (let i = 0; i < tabs.length; i++) {
    const elem = tabs[i];
    const isTab = elem.hasAttribute("role") && elem.getAttribute("role") === "tab";
    if (!isTab) continue;

    const isSelectedTab =
      elem.hasAttribute("aria-selected") && elem.getAttribute("aria-selected") === "true";
    if (isSelectedTab) {
      elem.click();
      break;
    }
  }
};
