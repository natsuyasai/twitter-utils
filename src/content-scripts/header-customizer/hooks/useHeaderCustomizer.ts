import { useEffect, useState, useCallback, useRef } from "react";
import { getSettings } from "../../../shared/settings";
import { isEnableURL } from "../../utlis/tabs";
import type { NavLink } from "../types";
import {
  NAV_VISIBLE_KEY,
  TWEET_INPUT_HIDE_STYLE_ID,
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
    return stored === null ? true : stored === "true";
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
        // ヘッダーを非表示
        header.style.display = "none";
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
        // ヘッダーを非表示
        const header = document.querySelector<HTMLElement>(
          "header[role='banner']"
        );
        if (header) {
          header.style.display = "none";
        }
      }
    };

    // 即座に実行
    if (extractLinks()) {
      return;
    }

    // ヘッダーが見つからない場合は監視
    const observer = new MutationObserver(() => {
      if (extractLinks()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 最大3秒後にタイムアウトしてフォールバックを使用
    const timeout = setTimeout(() => {
      observer.disconnect();
      // まだリンクが抽出できていない場合はフォールバックを使用
      if (navLinks.length === 0) {
        applyFallbackLinks();
      }
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
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
