// https://x.com/*/status/*/photo/*のページからhttps://x.com/homeに戻った際にスクロール位置を復元するコンテンツスクリプト

const STORAGE_KEY = "x-home-previous-photo-url";
const HOME_URL_PATTERN = /^https:\/\/x\.com\/home/;
const PHOTO_URL_PATTERN =
  /^https:\/\/x\.com\/(.+)\/status\/(\d+)\/photo\/(\d+)/;
const MAX_SCROLL_ATTEMPTS = 50; // 最大スクロール試行回数
const SCROLL_STEP = 500; // 1回のスクロール量(px)
const SCROLL_INTERVAL = 400; // スクロール間隔(ms)

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
 * photoページのURLからベースパス（/username/status/id/photo/1 の形式）を抽出
 */
function extractPhotoBasePath(url: string): string | null {
  const match = url.match(PHOTO_URL_PATTERN);
  if (!match) {
    return null;
  }
  const [, username, statusId, photoNum] = match;
  return `/${username}/status/${statusId}/photo/${photoNum}`;
}

/**
 * 前回表示していたphotoページのURLを保存
 */
function savePhotoUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, url);
  } catch (error) {
    console.error("[Scroll Restore] Failed to save photo URL:", error);
  }
}

/**
 * 保存されたphotoページのURLを取得
 */
function getSavedPhotoUrl(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("[Scroll Restore] Failed to get saved photo URL:", error);
    return null;
  }
}

/**
 * 指定されたhrefを持つリンク要素を探す
 */
function findLinkElementByHref(targetPath: string): HTMLAnchorElement | null {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[role="link"]');
  for (const link of links) {
    const href = link.getAttribute("href");
    if (href && href === targetPath) {
      return link;
    }
  }
  return null;
}

/**
 * リンク要素が見つかるまでスクロールして探す
 */
function scrollToFindElement(targetPath: string): void {
  let attempts = 0;
  const initialScrollY = window.scrollY;

  const scrollInterval = setInterval(() => {
    attempts++;

    // リンク要素を探す
    const linkElement = findLinkElementByHref(targetPath);
    if (linkElement) {
      // 要素が見つかったらその位置までスクロール
      linkElement.scrollIntoView({ behavior: "smooth", block: "center" });
      clearInterval(scrollInterval);
      // 保存されたURLをクリア
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // 最大試行回数に達したら終了
    if (attempts >= MAX_SCROLL_ATTEMPTS) {
      clearInterval(scrollInterval);
      // 見つからなかった場合は元の位置に戻す
      window.scrollTo(0, initialScrollY);
      // 保存されたURLをクリア
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // 下にスクロール
    window.scrollBy(0, SCROLL_STEP);
  }, SCROLL_INTERVAL);
}

/**
 * スクロール位置を復元
 */
function restoreScrollPosition(): void {
  if (!isHomePage()) {
    return;
  }

  const savedPhotoUrl = getSavedPhotoUrl();
  if (!savedPhotoUrl) {
    return;
  }

  const targetPath = extractPhotoBasePath(savedPhotoUrl);
  if (!targetPath) {
    return;
  }

  // DOMの読み込みを待ってから探索開始
  setTimeout(() => {
    scrollToFindElement(targetPath);
  }, 1000);
}

/**
 * リンククリック時にphotoページのURLを保存
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
    savePhotoUrl(href);
  }
}

/**
 * ページ遷移の監視（History API対応）
 */
function observeNavigation(): void {
  let previousUrl = window.location.href;
  const wasPreviouslyPhotoPage = isPhotoPage();

  // 定期的にURL変更をチェックして previousUrl を更新
  setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== previousUrl) {
      previousUrl = currentUrl;
    }
  }, 500);

  // popstate イベント（ブラウザの戻る/進むボタン）
  window.addEventListener("popstate", () => {
    const currentUrl = window.location.href;
    const wasPhotoPage = PHOTO_URL_PATTERN.test(previousUrl);
    const isNowHomePage = isHomePage();

    if (wasPhotoPage && isNowHomePage) {
      // photoページからhomeページに戻った
      restoreScrollPosition();
    }

    previousUrl = currentUrl;
  });

  // History APIのpushStateとreplaceStateをオーバーライド
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const wasPhotoPage = isPhotoPage();

    // pushStateを実行
    originalPushState.apply(history, args);

    // URLが変更された後にチェック
    const isNowHomePage = isHomePage();
    const isNowPhotoPage = isPhotoPage();

    // photoページに遷移した場合はURLを保存
    if (isNowPhotoPage) {
      savePhotoUrl(window.location.href);
    }

    // photoページからhomeページに遷移した場合は復元
    if (wasPhotoPage && isNowHomePage) {
      restoreScrollPosition();
    }

    previousUrl = window.location.href;
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
}
