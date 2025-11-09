import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./AutoReload.module.scss";

interface IntervalOption {
  value: number;
  label: string;
  seconds: number;
}

interface Position {
  x: number;
  y: number;
}

const INTERVAL_OPTIONS: IntervalOption[] = [
  { value: 0, label: "5秒", seconds: 5 },
  { value: 1, label: "10秒", seconds: 10 },
  { value: 2, label: "15秒", seconds: 15 },
  { value: 3, label: "30秒", seconds: 30 },
  { value: 4, label: "45秒", seconds: 45 },
  { value: 5, label: "1分", seconds: 60 },
  { value: 6, label: "2分", seconds: 120 },
  { value: 7, label: "3分", seconds: 180 },
  { value: 8, label: "5分", seconds: 300 },
  { value: 9, label: "10分", seconds: 600 },
  { value: 10, label: "15分", seconds: 900 },
  { value: 11, label: "30分", seconds: 1800 },
];

const DEFAULT_INTERVAL = 300; // 5分
const DEFAULT_POSITION: Position = { x: 0, y: 40 };
const STORAGE_KEY = "auto-reload-position";

// localStorageから位置を取得
const getStoredPosition = (): Position => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load position from localStorage:", error);
  }
  return DEFAULT_POSITION;
};

// localStorageに位置を保存
const savePosition = (position: Position): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch (error) {
    console.error("Failed to save position to localStorage:", error);
  }
};

const AutoReload: React.FC = () => {
  const [currentInterval, setCurrentInterval] = useState(DEFAULT_INTERVAL);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isStopped, setIsStopped] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState<Position>(getStoredPosition);
  const [isDragging, setIsDragging] = useState(false);

  const timerIdRef = useRef<number>(-1);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // スクロール状態チェック
  const isScrolling = useCallback(() => {
    return document.scrollingElement
      ? document.scrollingElement.scrollTop > 0
      : false;
  }, []);

  // 実行可能なURLかチェック
  const isExecutableURL = useCallback(() => {
    const href = location.href;
    return (
      href === "https://x.com/" ||
      href.indexOf("https://x.com/home") >= 0 ||
      href.indexOf("https://x.com/notifications") >= 0 ||
      href.indexOf("https://x.com/search") >= 0
    );
  }, []);

  // タブの再選択（メイン処理）
  const reselectTab = useCallback(() => {
    const tabs = document.getElementsByTagName("a");
    for (let i = 0; i < tabs.length; i++) {
      const elem = tabs[i];
      const isTab =
        elem.hasAttribute("role") && elem.getAttribute("role") === "tab";
      if (!isTab) continue;

      const isSelectedTab =
        elem.hasAttribute("aria-selected") &&
        elem.getAttribute("aria-selected") === "true";
      if (isSelectedTab) {
        elem.click();
        break;
      }
    }
  }, []);

  // インターバル処理の再開
  const restartInterval = useCallback(
    (intervalSeconds: number) => {
      if (timerIdRef.current > 0) {
        clearInterval(timerIdRef.current);
      }
      timerIdRef.current = window.setInterval(() => {
        if (isStopped || isScrolling() || !isEnabled) {
          return;
        }
        reselectTab();
      }, 1000 * intervalSeconds);
    },
    [isStopped, isEnabled, isScrolling, reselectTab]
  );

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
  }, [updateURLState]);

  // インターバル処理の初期化と更新
  useEffect(() => {
    restartInterval(currentInterval);
    return () => {
      if (timerIdRef.current > 0) {
        clearInterval(timerIdRef.current);
      }
    };
  }, [currentInterval, restartInterval]);

  // 初回URL状態チェック
  useEffect(() => {
    updateURLState();
  }, [updateURLState]);

  // ON/OFFボタンハンドラ
  const handleToggle = () => {
    setIsStopped(!isStopped);
  };

  // インターバル変更ハンドラ
  const handleIntervalChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = parseInt(event.target.value, 10);
    const option = INTERVAL_OPTIONS.find((opt) => opt.value === value);
    if (option) {
      setCurrentInterval(option.seconds);
    }
  };

  // 表示/非表示切り替え
  const handleStatusClick = () => {
    setIsVisible(!isVisible);
  };

  // ドラッグ開始
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    event.preventDefault();
    event.stopPropagation();
  };

  // ドラッグ中
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      const newPosition = {
        x: event.clientX - dragStartRef.current.x,
        y: event.clientY - dragStartRef.current.y,
      };

      setPosition(newPosition);
    },
    [isDragging]
  );

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      // 位置を保存
      savePosition(position);
    }
  }, [isDragging, position]);

  // ドラッグイベントリスナーの登録
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handleMouseMove);
      window.addEventListener("pointerup", handleMouseUp);

      return () => {
        window.removeEventListener("pointermove", handleMouseMove);
        window.removeEventListener("pointerup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={styles.rootContainer}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* ドラッグハンドル */}
      <div
        className={styles.dragHandle}
        onPointerDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        aria-label="Drag to move"
      >
        ⋮⋮
      </div>

      {/* ステータスボタン */}
      <div className={styles.statusContainer}>
        <button
          className={styles.status}
          onClick={handleStatusClick}
          style={{ color: isEnabled ? "lightgreen" : "lightgray" }}
          aria-label="Toggle visibility"
        >
          ●
        </button>
      </div>

      {isVisible && (
        <>
          <div className={styles.buttonContainer}>
            <button
              className={styles.button}
              type="button"
              onClick={handleToggle}
              style={{ backgroundColor: isStopped ? "gray" : "#03A9F4" }}
            >
              {isStopped ? "OFF" : "ON"}
            </button>
          </div>

          <div className={styles.selectedContainer}>
            <select
              className={styles.intervalSetting}
              name="setting"
              size={1}
              onChange={handleIntervalChange}
              defaultValue={8}
            >
              {INTERVAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default AutoReload;
