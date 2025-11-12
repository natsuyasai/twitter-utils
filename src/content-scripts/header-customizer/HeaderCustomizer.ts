import { isEnableURL } from "../utlis/tabs";
import { getSettings } from "../../shared/settings";
import styles from "./HeaderCustomizer.module.scss";

const TOGGLE_BUTTON_ID = "twitter-utils-header-toggle";
const NAV_BAR_ID = "twitter-utils-custom-nav-bar";
const NAV_VISIBLE_KEY = "twitter-utils-nav-visible";

let customNavBar: HTMLElement | null = null;
let toggleButton: HTMLElement | null = null;
let originalHeader: HTMLElement | null = null;
let visibleLinks: string[] = [];

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
  // 既存のナビゲーションバーがあれば削除
  const existing = document.getElementById(NAV_BAR_ID);
  if (existing) {
    existing.remove();
  }

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

    if (customNavBar) {
      customNavBar.appendChild(linkElement);
    }
  });

  // 表示状態を復元
  const isVisible = getNavVisibility();
  if (!isVisible) {
    customNavBar.classList.add(styles.hidden);
  }

  document.body.appendChild(customNavBar);
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
  if (document.getElementById(TOGGLE_BUTTON_ID)) {
    return;
  }

  toggleButton = document.createElement("button");
  toggleButton.id = TOGGLE_BUTTON_ID;
  toggleButton.className = styles.toggleButton;
  toggleButton.textContent = getNavVisibility() ? "×" : "☰";
  toggleButton.title = getNavVisibility()
    ? "ナビゲーションを非表示"
    : "ナビゲーションを表示";

  toggleButton.addEventListener("click", toggleNavVisibility);

  document.body.appendChild(toggleButton);
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
 * ヘッダーをカスタマイズ
 */
function customizeHeader() {
  if (!isEnableURL()) {
    return;
  }

  // 元のヘッダーを非表示
  hideOriginalHeader();

  // カスタムナビゲーションバーを作成
  if (originalHeader) {
    createCustomNavBar();
  }

  // トグルボタンを作成
  createToggleButton();
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
