import { getSettings } from "../../shared/settings";

let imageWidth = "100px";

/**
 * 設定を読み込む
 */
async function loadSettings() {
  const settings = await getSettings();
  imageWidth = settings.imageSize.imageWidth;
}

/**
 * スタイル適用
 */
function addStyle() {
  const css = `
div[data-testid="card.layoutLarge.media"]>a>div:has(img) {
    width: ${imageWidth} !important;
}
[data-testid="card.layoutLarge.media"]>a {
    flex-direction: row !important;
}
`;
  const styleElement = document.createElement("style");
  styleElement.innerHTML = css;
  document.head.append(styleElement);
}

function setSmallImage() {
  const images = document.body.querySelectorAll(
    "div[data-testid='tweetPhoto']"
  );
  images.forEach((image) => {
    const root = getImageRoot(image);
    if (root === null) {
      return;
    }
    root.style.width = imageWidth;
  });
}

/**
 * @param {Element} element
 */
function getImageRoot(element: Element) {
  if (element.parentElement === null) {
    return null;
  }
  // 引用RTの場合はリンク要素がaタグではなくdivになっている
  if (
    element.parentElement.getAttribute("role") === "link" &&
    element.parentElement.tagName.toLocaleLowerCase() === "div"
  ) {
    return null;
  }
  const ariaLabelledby = element.parentElement.getAttribute("aria-labelledby");
  if (ariaLabelledby) {
    return element.parentElement;
  }
  return getImageRoot(element.parentElement);
}

function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        setSmallImage();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export async function initializeImageSizeChanger() {
  await loadSettings();
  addStyle();
  setSmallImage();
  observeDOMChanges();
}
