import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./ImagePopup.module.scss";

interface ImagePopupProps {
  url: string;
  onClose: () => void;
}

const ImagePopup: React.FC<ImagePopupProps> = ({ url, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const clickFirstImage = useCallback(() => {
    if (!iframeRef.current) return;

    try {
      const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (!iframeDocument) return;

      const TIMEOUT_MS = 10000; // 10秒でタイムアウト
      let timeoutId: number | null = null;
      let observer: MutationObserver | null = null;

      const clickImage = () => {
        const firstImage = iframeDocument.querySelector("div[data-testid='tweetPhoto']");
        if (firstImage) {
          (firstImage as HTMLElement).click();
          cleanup();
          return true;
        }
        return false;
      };

      const cleanup = () => {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      // 即座にチェック
      if (clickImage()) {
        return;
      }

      // MutationObserverでDOM変更を監視
      observer = new MutationObserver(() => {
        if (clickImage()) {
          // 画像が見つかったのでクリック完了
        }
      });

      observer.observe(iframeDocument.body, {
        childList: true,
        subtree: true,
      });

      // タイムアウト設定
      timeoutId = window.setTimeout(() => {
        console.debug("Timeout: Could not find tweetPhoto element in iframe");
        cleanup();
      }, TIMEOUT_MS);
    } catch (error) {
      // クロスオリジンの場合はアクセスできないため無視
      console.debug("Cannot access iframe content (cross-origin):", error);
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    clickFirstImage();
  }, [clickFirstImage]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close popup"
          >
            ✕
          </button>
          <div className={styles.urlDisplay}>{url}</div>
        </div>
        <div className={styles.content}>
          {isLoading && <div className={styles.loading}>読み込み中...</div>}
          <iframe
            ref={iframeRef}
            src={url}
            className={styles.iframe}
            onLoad={handleIframeLoad}
            title="Image link preview"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;
