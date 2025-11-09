import React, { useRef } from "react";
import styles from "./AutoReload.module.scss";
import { INTERVAL_OPTIONS, DEFAULT_INTERVAL } from "./constants";
import { isScrolling, isExecutableURL, reselectTab } from "./utils";
import { useDraggable } from "./hooks/useDraggable";
import { useAutoReloadInterval } from "./hooks/useAutoReloadInterval";
import { useAutoReloadState } from "./hooks/useAutoReloadState";
import { useTabSwitchDetection } from "./hooks/useTabSwitchDetection";

const AutoReload: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // ドラッグ&ドロップ機能
  const { position, isDragging, handleMouseDown } = useDraggable();

  // インターバル管理（先に定義してrestoreIntervalSettingを取得）
  const autoReloadIntervalResult = useAutoReloadInterval({
    intervalOptions: INTERVAL_OPTIONS,
    defaultInterval: DEFAULT_INTERVAL,
    onTabReselect: reselectTab,
    // これらは後から渡すため初期値を使用
    isStopped: false,
    isEnabled: true,
    isScrolling,
  });

  // 自動リロード状態管理
  const { isEnabled, isStopped, isVisible, handleToggle, handleStatusClick } =
    useAutoReloadState({
      isExecutableURL,
      isScrolling,
      onURLChange: autoReloadIntervalResult.restoreIntervalSetting,
    });

  // タブ切り替え検知
  useTabSwitchDetection({
    onTabSwitch: autoReloadIntervalResult.restoreIntervalSetting,
  });

  // インターバル管理のフック結果を展開
  const { selectedIntervalIndex, handleIntervalChange } = autoReloadIntervalResult;

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
              value={selectedIntervalIndex}
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
