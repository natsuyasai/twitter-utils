import { createRoot, type Root } from "react-dom/client";
import { getSettings } from "../../shared/settings";
import ImagePopup from "./ImagePopup";

let isEnabled = false;
let root: Root | null = null;
let containerElement: HTMLElement | null = null;

/**
 * 設定を読み込む
 */
async function loadSettings() {
  const settings = await getSettings();
  isEnabled = settings.imageLink.openInIframe;
}

/**
 * リンク先のURLを取得
 */
function findLinkUrl(element: Element): string | null {
  let current: Element | null = element;
  while (current && current !== document.body) {
    if (current.tagName === "A" && current.getAttribute("role") === "link") {
      return current.getAttribute("href");
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * ポップアップを表示
 */
function showPopup(url: string) {
  if (!containerElement) {
    containerElement = document.createElement("div");
    containerElement.id = "twitter-utils-image-popup";
    document.body.appendChild(containerElement);
  }

  if (!root) {
    root = createRoot(containerElement);
  }

  const handleClose = () => {
    if (root && containerElement) {
      root.unmount();
      root = null;
      if (containerElement.parentElement) {
        containerElement.parentElement.removeChild(containerElement);
      }
      containerElement = null;
    }
  };

  root.render(<ImagePopup url={url} onClose={handleClose} />);
}

/**
 * 画像要素にクリックイベントを登録
 */
function attachClickEvent(imageElement: Element) {
  // 既にイベントが登録されているかチェック
  if (imageElement.getAttribute("data-popup-attached") === "true") {
    return;
  }

  imageElement.setAttribute("data-popup-attached", "true");
  imageElement.addEventListener("click", (e) => {
    if (!isEnabled) {
      return;
    }

    const url = findLinkUrl(imageElement);
    if (url) {
      e.preventDefault();
      e.stopPropagation();
      showPopup(url);
    }
  });
}

/**
 * すべての画像要素にイベントを登録
 */
function attachAllEvents() {
  const images = document.querySelectorAll("div[data-testid='tweetPhoto']");
  images.forEach((image) => attachClickEvent(image));
}

/**
 * DOM変更を監視
 */
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        attachAllEvents();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * 初期化
 */
export async function initializeImagePopup() {
  await loadSettings();
  if (!isEnabled) {
    return;
  }
  attachAllEvents();
  observeDOMChanges();
}
