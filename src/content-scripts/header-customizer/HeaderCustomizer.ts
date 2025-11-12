import { isEnableURL } from "../utlis/tabs";
import { getSettings } from "../../shared/settings";
import styles from "./HeaderCustomizer.module.scss";

const TOGGLE_BUTTON_ID = "twitter-utils-header-toggle";
const NAV_BAR_ID = "twitter-utils-custom-nav-bar";
const NAV_CONTAINER_ID = "twitter-utils-nav-container";
const NAV_VISIBLE_KEY = "twitter-utils-nav-visible";
const TWEET_INPUT_HIDE_STYLE_ID = "twitter-utils-tweet-input-hide-style";

let navContainer: HTMLElement | null = null;
let customNavBar: HTMLElement | null = null;
let toggleButton: HTMLElement | null = null;
let originalHeader: HTMLElement | null = null;
let visibleLinks: string[] = [];
let composeButton: HTMLAnchorElement | null = null;
let isTweetInputVisible = false;

interface NavLink {
  href: string;
  ariaLabel: string;
  svgContent: string;
  label: string; // spanタグ内のラベル
}

/**
 * 設定を読み込む
 */
async function loadSettings() {
  const settings = await getSettings();
  visibleLinks = settings.headerCustomizer.visibleLinks;
}

/**
 * ツイート入力エリアを非表示にするスタイルを追加
 */
function hideTweetInputArea() {
  const existingStyle = document.getElementById(TWEET_INPUT_HIDE_STYLE_ID);
  if (existingStyle) {
    return;
  }

  const style = document.createElement("style");
  style.id = TWEET_INPUT_HIDE_STYLE_ID;
  style.textContent = `
    div:has(> [role="progressbar"] + * div[data-testid*="tweetTextarea"]) {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  isTweetInputVisible = false;
}

/**
 * ツイート入力エリアを表示する
 */
function showTweetInputArea() {
  const existingStyle = document.getElementById(TWEET_INPUT_HIDE_STYLE_ID);
  if (existingStyle) {
    existingStyle.remove();
  }
  isTweetInputVisible = true;
}

/**
 * ツイート入力エリアの表示状態を切り替え
 */
function toggleTweetInputArea() {
  if (isTweetInputVisible) {
    hideTweetInputArea();
    updateComposeButton(false);
  } else {
    showTweetInputArea();
    updateComposeButton(true);
  }
}

/**
 * ポストボタンの表示を更新
 */
function updateComposeButton(isOpen: boolean) {
  if (!composeButton) {
    return;
  }

  const svg = composeButton.querySelector("svg");
  if (!svg) {
    return;
  }

  if (isOpen) {
    // 閉じるボタンのアイコンに変更（×マーク）
    svg.innerHTML = `
      <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
    `;
    composeButton.setAttribute("aria-label", "閉じる");
  } else {
    // 元のポストアイコンに戻す（ペンマーク）
    svg.innerHTML = `
      <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z"></path>
    `;
    composeButton.setAttribute("aria-label", "ポストする");
  }
}

/**
 * ナビゲーションバーの表示状態を取得
 */
function getNavVisibility(): boolean {
  const stored = localStorage.getItem(NAV_VISIBLE_KEY);
  return stored === null ? true : stored === "true";
}

/**
 * ナビゲーションバーの表示状態を保存
 */
function saveNavVisibility(visible: boolean) {
  localStorage.setItem(NAV_VISIBLE_KEY, visible.toString());
}

/**
 * 元のヘッダーからリンク情報を抽出
 */
function extractNavLinks(): NavLink[] {
  if (!originalHeader) {
    return [];
  }

  const links: NavLink[] = [];
  const anchorElements =
    originalHeader.querySelectorAll<HTMLAnchorElement>('a[role="link"]');

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
      if (visibleLinks.length === 0 || visibleLinks.includes(ariaLabel)) {
        links.push({
          href,
          ariaLabel: ariaLabel || "",
          svgContent: svg.outerHTML,
          label: ariaLabel,
        });
      }
    }
  });

  return links;
}

/**
 * カスタムナビゲーションバーを作成
 */
function createCustomNavBar() {
  // 新しいナビゲーションバーを作成
  customNavBar = document.createElement("div");
  customNavBar.id = NAV_BAR_ID;
  customNavBar.className = styles.customNavBar;

  // リンク情報を抽出
  const navLinks = extractNavLinks();

  // 各リンクを生成
  navLinks.forEach((linkData) => {
    const linkElement = document.createElement("a");
    linkElement.href = linkData.href;
    linkElement.className = styles.navLink;
    linkElement.setAttribute("aria-label", linkData.ariaLabel);
    linkElement.innerHTML = linkData.svgContent;

    // SVGのサイズを調整
    const svg = linkElement.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", "24");
      svg.setAttribute("height", "24");
    }

    // /compose/post のリンクの場合は特別な処理
    if (linkData.href === "/compose/post") {
      composeButton = linkElement;
      linkElement.addEventListener("click", (e) => {
        e.preventDefault();
        toggleTweetInputArea();
      });
    }

    if (customNavBar) {
      customNavBar.appendChild(linkElement);
    }
  });

  // 表示状態を復元
  const isVisible = getNavVisibility();
  if (!isVisible) {
    customNavBar.classList.add(styles.hidden);
  }
}

/**
 * 元のヘッダーを非表示にする
 */
function hideOriginalHeader() {
  const header = document.querySelector<HTMLElement>("header[role='banner']");
  if (!header) {
    return;
  }

  originalHeader = header;
  header.style.display = "none";
}

/**
 * トグルボタンを作成
 */
function createToggleButton() {
  toggleButton = document.createElement("button");
  toggleButton.id = TOGGLE_BUTTON_ID;
  toggleButton.className = styles.toggleButton;
  toggleButton.textContent = getNavVisibility() ? "×" : "☰";
  toggleButton.title = getNavVisibility()
    ? "ナビゲーションを非表示"
    : "ナビゲーションを表示";

  toggleButton.addEventListener("click", toggleNavVisibility);
}

/**
 * ナビゲーションバーの表示/非表示を切り替え
 */
function toggleNavVisibility() {
  if (!customNavBar || !toggleButton) {
    return;
  }

  const isVisible = !customNavBar.classList.contains(styles.hidden);
  const newVisibility = !isVisible;

  if (newVisibility) {
    customNavBar.classList.remove(styles.hidden);
    toggleButton.textContent = "×";
    toggleButton.title = "ナビゲーションを非表示";
  } else {
    customNavBar.classList.add(styles.hidden);
    toggleButton.textContent = "☰";
    toggleButton.title = "ナビゲーションを表示";
  }

  saveNavVisibility(newVisibility);
}

/**
 * ナビゲーションコンテナを作成
 */
function createNavContainer() {
  // 既存のコンテナがあれば削除
  const existing = document.getElementById(NAV_CONTAINER_ID);
  if (existing) {
    existing.remove();
  }

  // コンテナを作成
  navContainer = document.createElement("div");
  navContainer.id = NAV_CONTAINER_ID;
  navContainer.className = styles.navContainer;

  // トグルボタンを作成
  createToggleButton();

  // カスタムナビゲーションバーを作成
  createCustomNavBar();

  // コンテナに追加
  if (toggleButton) {
    navContainer.appendChild(toggleButton);
  }
  if (customNavBar) {
    navContainer.appendChild(customNavBar);
  }

  // bodyに追加
  document.body.appendChild(navContainer);
}

/**
 * ヘッダーをカスタマイズ
 */
function customizeHeader() {
  if (!isEnableURL()) {
    return;
  }

  // 元のヘッダーを非表示
  hideOriginalHeader();

  // ツイート入力エリアを非表示にする
  hideTweetInputArea();

  // ナビゲーションコンテナを作成
  if (originalHeader) {
    createNavContainer();
  }
}

/**
 * URL変更を監視
 */
function watchURLChange() {
  const observer = new MutationObserver(() => {
    customizeHeader();
  });

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
 * 初期化
 */
export async function initializeHeaderCustomizer() {
  if (!isEnableURL()) {
    return;
  }

  // 設定を読み込む
  await loadSettings();

  // 少し遅延してから実行（ヘッダーの読み込みを待つ）
  setTimeout(() => {
    customizeHeader();
    watchURLChange();
  }, 1000);
}
