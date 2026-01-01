import { useState, useCallback, useEffect } from "react";

interface UseAutoReloadStateProps {
  isExecutableURL: () => boolean;
  isScrolling: () => boolean;
  onURLChange?: () => void;
}

export const useAutoReloadState = ({
  isExecutableURL,
  isScrolling,
  onURLChange,
}: UseAutoReloadStateProps) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (isExecutableURL()) {
      return !isScrolling();
    }
    return false;
  });
  const [isStopped, setIsStopped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // URLの状態更新
  const updateURLState = useCallback(() => {
    if (isExecutableURL()) {
      setIsEnabled(!isScrolling());
    } else {
      setIsEnabled(false);
    }
  }, [isExecutableURL, isScrolling]);

  // スクロールイベント処理
  useEffect(() => {
    let timeoutId: number;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (isScrolling()) {
          setIsEnabled(false);
        } else {
          setIsEnabled(true);
        }
      }, 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [isScrolling]);

  // URL変更監視
  useEffect(() => {
    let timeoutId: number;
    const handleMutation = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        updateURLState();
        onURLChange?.();
      }, 500);
    };

    const observer = new MutationObserver(handleMutation);
    const mainElement = document.getElementsByTagName("main");
    const config = { childList: true, subtree: true };

    if (mainElement.length > 0) {
      observer.observe(mainElement[0], config);
    } else {
      const retryTimeout = window.setTimeout(() => {
        const retryMain = document.getElementsByTagName("main");
        if (retryMain.length > 0) {
          observer.observe(retryMain[0], config);
        }
      }, 1000);
      return () => clearTimeout(retryTimeout);
    }

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [updateURLState, onURLChange]);

  // ON/OFFボタンハンドラ
  const handleToggle = useCallback(() => {
    setIsStopped(!isStopped);
  }, [isStopped]);

  // 表示/非表示切り替え
  const handleStatusClick = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  return {
    isEnabled,
    isStopped,
    isVisible,
    handleToggle,
    handleStatusClick,
  };
};
