/**
 * スクロール状態をチェック
 */
export const isScrolling = (): boolean => {
  return document.scrollingElement
    ? document.scrollingElement.scrollTop > 0
    : false;
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
 * フォロー中タブか判定する
 * フォロー中タブは aria-expanded 属性を持つ
 */
export const isFollowingTab = (elem: Element): boolean => {
  return elem.hasAttribute("aria-expanded");
};

/**
 * 現在フォロー中タブが選択されているか
 */
export const isFollowingTabActive = (): boolean => {
  const tabs = document.querySelectorAll("div[role='tab']");
  for (const elem of tabs) {
    if (
      elem.hasAttribute("aria-selected") &&
      elem.getAttribute("aria-selected") === "true" &&
      isFollowingTab(elem)
    ) {
      return true;
    }
  }
  return false;
};

/**
 * 「新しいポストを表示」ボタンを探す
 * article を含まない cellInnerDiv 内の button を対象とする
 */
export const findNewPostsButton = (): HTMLButtonElement | null => {
  const section = document.querySelector("section[aria-labelledby]");
  if (!section) return null;
  const cells = section.querySelectorAll('[data-testid="cellInnerDiv"]');
  for (const cell of cells) {
    if (cell.querySelector("article")) continue;
    const btn = cell.querySelector('button[type="button"]');
    if (btn) return btn as HTMLButtonElement;
  }
  return null;
};

/**
 * 「新しいポストを表示」ボタンが出現するのを待ってクリックする
 * MutationObserver でボタンの出現を監視し、最大30秒待機する
 */
export const waitAndClickNewPostsButton = (): void => {
  const btn = findNewPostsButton();
  if (btn) {
    btn.click();
    return;
  }
  const section = document.querySelector("section[aria-labelledby]");
  if (!section) return;
  const observer = new MutationObserver(() => {
    const found = findNewPostsButton();
    if (found) {
      observer.disconnect();
      found.click();
    }
  });
  observer.observe(section, { childList: true, subtree: true });
  setTimeout(() => {
    observer.disconnect();
  }, 30000);
};

/**
 * フォロー中タブの更新を誘発する
 * focusイベントでX内部のrevalidateOnFocusを起動し、新しいポストボタンを自動クリックする
 */
export const triggerFollowingRefresh = (): void => {
  window.dispatchEvent(new Event("focus"));
  waitAndClickNewPostsButton();
};

/**
 * タブの再選択（メイン処理）
 * フォロー中タブは専用タイマーで更新するためスキップする
 */
export const reselectTab = (): void => {
  const tabs = document.querySelectorAll("div[role='tab']");
  for (const elem of tabs) {
    const isSelectedTab =
      elem.hasAttribute("aria-selected") &&
      elem.getAttribute("aria-selected") === "true";
    if (isSelectedTab) {
      if (!isFollowingTab(elem)) {
        (elem as HTMLElement).click();
      }
      break;
    }
  }
};
