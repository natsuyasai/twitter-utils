import { useEffect, useState, useCallback, useRef } from "react";
import { getSettings } from "../../../shared/settings";
import { isEnableURL } from "../../utlis/tabs";
import type { NavLink } from "../types";
import {
  NAV_VISIBLE_KEY,
  TWEET_INPUT_HIDE_STYLE_ID,
  HEADER_HIDE_STYLE_ID,
  CLOSE_ICON_PATH,
  COMPOSE_ICON_PATH,
  DEFAULT_NAV_LINKS,
} from "../types";

export function useHeaderCustomizer() {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [visibleLinks, setVisibleLinks] = useState<string[]>([]);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [isNavVisible, setIsNavVisible] = useState<boolean>(() => {
    const stored = localStorage.getItem(NAV_VISIBLE_KEY);
    return stored === null ? false : stored === "true";
  });
  const [isTweetInputVisible, setIsTweetInputVisible] =
    useState<boolean>(false);

  const composeButtonRef = useRef<HTMLAnchorElement | null>(null);

  // URLチェック
  useEffect(() => {
    setIsEnabled(isEnableURL());
  }, []);

  // 設定を読み込む
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const loadSettings = async () => {
      const settings = await getSettings();
      setVisibleLinks(settings.headerCustomizer.visibleLinks);
    };
    loadSettings();
  }, [isEnabled]);

  // ヘッダーを非表示にする
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const existingStyle = document.getElementById(HEADER_HIDE_STYLE_ID);
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = HEADER_HIDE_STYLE_ID;
      style.textContent = `
        header[role="banner"] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const styleToRemove = document.getElementById(HEADER_HIDE_STYLE_ID);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [isEnabled]);

  // 元のヘッダーを非表示にしてリンクを抽出する
  useEffect(() => {
    // 設定が読み込まれていない場合は処理しない
    if (visibleLinks.length === 0) {
      return;
    }

    const extractLinks = () => {
      const header = document.querySelector<HTMLElement>(
        "header[role='banner']"
      );
      if (!header) {
        return false;
      }

      // リンク情報を抽出
      const links: NavLink[] = [];
      const anchorElements =
        header.querySelectorAll<HTMLAnchorElement>('a[role="link"]');

      anchorElements.forEach((anchor) => {
        const href = anchor.getAttribute("href");
        const ariaLabel = anchor.getAttribute("aria-label");
        const svg = anchor.querySelector("svg");

        // aria-label="X"のリンクは除外（Xロゴのホームリンク）
        if (ariaLabel === "X") {
          return;
        }

        if (href && svg && ariaLabel) {
          // 設定でフィルタリング
          if (visibleLinks.includes(ariaLabel)) {
            links.push({
              href,
              ariaLabel: ariaLabel || "",
              svgContent: svg.outerHTML,
              label: ariaLabel,
            });
          }
        }
      });

      if (links.length > 0) {
        setNavLinks(links);
        return true;
      }

      return false;
    };

    // フォールバック: デフォルトのナビゲーションリンクを使用
    const applyFallbackLinks = () => {
      const links: NavLink[] = [];
      visibleLinks.forEach((label) => {
        const defaultLink = DEFAULT_NAV_LINKS[label];
        if (defaultLink) {
          links.push(defaultLink);
        }
      });

      if (links.length > 0) {
        setNavLinks(links);
      }
    };

    let retryCount = 0;
    const maxRetries = 10; // 最大10回リトライ
    const retryInterval = 200; // 200msごとにリトライ
    let retryTimer: NodeJS.Timeout | null = null;
    let timeoutTimer: NodeJS.Timeout | null = null;
    let observer: MutationObserver | null = null;

    const tryExtractLinks = () => {
      if (extractLinks()) {
        // 成功したらすべてのタイマーとオブザーバーをクリア
        if (retryTimer) clearInterval(retryTimer);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (observer) observer.disconnect();
        return true;
      }
      return false;
    };

    // ページ読み込み直後のための遅延実行とリトライ処理
    const startInitialDelay = setTimeout(() => {
      // 初回実行
      if (tryExtractLinks()) {
        return;
      }

      // 見つからなかった場合、一定間隔でリトライ
      retryTimer = setInterval(() => {
        retryCount++;

        if (tryExtractLinks()) {
          return;
        }

        // 最大リトライ回数に達したらインターバルを停止してMutationObserverに切り替え
        if (retryCount >= maxRetries) {
          if (retryTimer) clearInterval(retryTimer);

          // MutationObserverで監視
          observer = new MutationObserver(() => {
            if (extractLinks()) {
              if (observer) observer.disconnect();
              if (timeoutTimer) clearTimeout(timeoutTimer);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
        }
      }, retryInterval);

      // 最大5秒後にタイムアウトしてフォールバックを使用
      timeoutTimer = setTimeout(() => {
        if (retryTimer) clearInterval(retryTimer);
        if (observer) observer.disconnect();
        // まだリンクが抽出できていない場合はフォールバックを使用
        if (navLinks.length === 0) {
          applyFallbackLinks();
        }
      }, 5000);
    }, 100); // 初回実行を100ms遅延

    return () => {
      clearTimeout(startInitialDelay);
      if (retryTimer) clearInterval(retryTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (observer) observer.disconnect();
    };
  }, [visibleLinks, navLinks.length]);

  // ツイート入力エリアを非表示にする
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const existingStyle = document.getElementById(TWEET_INPUT_HIDE_STYLE_ID);
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = TWEET_INPUT_HIDE_STYLE_ID;
      style.textContent = `
        div:has(> [role="progressbar"] + * div[data-testid*="tweetTextarea"]) {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      setIsTweetInputVisible(false);
    }

    return () => {
      const styleToRemove = document.getElementById(TWEET_INPUT_HIDE_STYLE_ID);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [isEnabled]);

  // ナビゲーションバーの表示/非表示を切り替え
  const toggleNavVisibility = useCallback(() => {
    const newVisibility = !isNavVisible;
    setIsNavVisible(newVisibility);
    localStorage.setItem(NAV_VISIBLE_KEY, newVisibility.toString());
  }, [isNavVisible]);

  // ツイート入力エリアの表示/非表示を切り替え
  const toggleTweetInputArea = useCallback(() => {
    const existingStyle = document.getElementById(TWEET_INPUT_HIDE_STYLE_ID);

    if (isTweetInputVisible) {
      // 非表示にする
      if (!existingStyle) {
        const style = document.createElement("style");
        style.id = TWEET_INPUT_HIDE_STYLE_ID;
        style.textContent = `
          div:has(> [role="progressbar"] + * div[data-testid*="tweetTextarea"]) {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
      setIsTweetInputVisible(false);

      // ボタンアイコンを元に戻す
      if (composeButtonRef.current) {
        const svg = composeButtonRef.current.querySelector("svg");
        if (svg) {
          svg.innerHTML = `<path d="${COMPOSE_ICON_PATH}"></path>`;
          composeButtonRef.current.setAttribute("aria-label", "ポストする");
        }
      }
    } else {
      // 表示する
      if (existingStyle) {
        existingStyle.remove();
      }
      setIsTweetInputVisible(true);

      // ボタンアイコンを閉じるに変更
      if (composeButtonRef.current) {
        const svg = composeButtonRef.current.querySelector("svg");
        if (svg) {
          svg.innerHTML = `<path d="${CLOSE_ICON_PATH}"></path>`;
          composeButtonRef.current.setAttribute("aria-label", "閉じる");
        }
      }
    }
  }, [isTweetInputVisible]);

  return {
    isEnabled,
    navLinks,
    isNavVisible,
    isTweetInputVisible,
    toggleNavVisibility,
    toggleTweetInputArea,
    composeButtonRef,
  };
}
