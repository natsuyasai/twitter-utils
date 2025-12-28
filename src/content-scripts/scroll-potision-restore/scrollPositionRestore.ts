// https://x.com/*/status/*/photo/*のページからhttps://x.com/homeに戻った際にスクロール位置を復元するコンテンツスクリプト

const STORAGE_KEY = "x-home-scroll-position";
const HOME_URL_PATTERN = /^https:\/\/x\.com\/home/;
const PHOTO_URL_PATTERN = /^https:\/\/x\.com\/.+\/status\/.+\/photo\/.+/;

/**
 * 現在のページがhomeページかどうか
 */
function isHomePage(): boolean {
  return HOME_URL_PATTERN.test(window.location.href);
}

/**
 * 現在のページがphotoページかどうか
 */
function isPhotoPage(): boolean {
  return PHOTO_URL_PATTERN.test(window.location.href);
}

/**
 * スクロール位置を保存
 */
function saveScrollPosition(): void {
  if (!isHomePage()) {
    return;
  }

  const scrollY = window.scrollY;
  try {
    localStorage.setItem(STORAGE_KEY, scrollY.toString());
    console.log(`[Scroll Restore] Saved scroll position: ${scrollY}`);
  } catch (error) {
    console.error("[Scroll Restore] Failed to save scroll position:", error);
  }
}

/**
 * スクロール位置を復元
 */
function restoreScrollPosition(): void {
  if (!isHomePage()) {
    return;
  }

  try {
    const storedPosition = localStorage.getItem(STORAGE_KEY);
    if (storedPosition !== null) {
      const scrollY = parseInt(storedPosition, 10);
      if (!isNaN(scrollY)) {
        // スクロール位置の復元は少し遅延させる（DOMの読み込みを待つ）
        setTimeout(() => {
          window.scrollTo(0, scrollY);
          console.log(`[Scroll Restore] Restored scroll position: ${scrollY}`);
        }, 100);
      }
    }
  } catch (error) {
    console.error("[Scroll Restore] Failed to restore scroll position:", error);
  }
}

/**
 * リンククリック時にスクロール位置を保存
 */
function handleLinkClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const link = target.closest("a");

  if (!link || !isHomePage()) {
    return;
  }

  // photoページへの遷移を検出
  const href = link.href;
  if (PHOTO_URL_PATTERN.test(href)) {
    saveScrollPosition();
  }
}

/**
 * ページ遷移の監視（History API対応）
 */
function observeNavigation(): void {
  let previousUrl = window.location.href;
  const wasPreviouslyPhotoPage = isPhotoPage();

  // popstate イベント（ブラウザの戻る/進むボタン）
  window.addEventListener("popstate", () => {
    const currentUrl = window.location.href;
    const wasPhotoPage = PHOTO_URL_PATTERN.test(previousUrl);

    if (wasPhotoPage && isHomePage()) {
      // photoページからhomeページに戻った
      restoreScrollPosition();
    } else if (isHomePage()) {
      // homeページから別のページに遷移する直前
      saveScrollPosition();
    }

    previousUrl = currentUrl;
  });

  // History APIのpushStateとreplaceStateをオーバーライド
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const wasHomePage = isHomePage();
    if (wasHomePage) {
      saveScrollPosition();
    }

    originalPushState.apply(history, args);

    const currentUrl = window.location.href;
    const wasPhotoPage = PHOTO_URL_PATTERN.test(previousUrl);

    if (wasPhotoPage && isHomePage()) {
      restoreScrollPosition();
    }

    previousUrl = currentUrl;
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    previousUrl = window.location.href;
  };

  // 初回ロード時: 前のページがphotoページだった可能性がある場合は復元
  if (wasPreviouslyPhotoPage && isHomePage()) {
    restoreScrollPosition();
  }
}

/**
 * スクロール位置復元機能の初期化
 */
export function initializeScrollPositionRestore(): void {
  // ページ遷移の監視
  observeNavigation();

  // リンククリックの監視
  document.addEventListener("click", handleLinkClick, true);

  console.log("[Scroll Restore] Initialized");
}
