import { useState, useCallback, useEffect, useRef } from "react";
import { getStoredInterval, saveInterval } from "../storage";

interface IntervalOption {
  value: number;
  label: string;
  seconds: number;
}

interface UseAutoReloadIntervalProps {
  intervalOptions: IntervalOption[];
  defaultInterval: number;
  onTabReselect: () => void;
  isStopped: boolean;
  isEnabled: boolean;
  isScrolling: () => boolean;
}

export const useAutoReloadInterval = ({
  intervalOptions,
  defaultInterval,
  onTabReselect,
  isStopped,
  isEnabled,
  isScrolling,
}: UseAutoReloadIntervalProps) => {
  const [currentInterval, setCurrentInterval] = useState(defaultInterval);
  const [selectedIntervalIndex, setSelectedIntervalIndex] = useState(() =>
    getStoredInterval(intervalOptions.length)
  );
  const timerIdRef = useRef<number>(-1);

  // インターバル設定を復元する関数
  const restoreIntervalSetting = useCallback(() => {
    const storedIndex = getStoredInterval(intervalOptions.length);
    const option = intervalOptions.find((opt) => opt.value === storedIndex);
    if (option) {
      setSelectedIntervalIndex(storedIndex);
      setCurrentInterval(option.seconds);
    }
  }, [intervalOptions]);

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
        onTabReselect();
      }, 1000 * intervalSeconds);
    },
    [isStopped, isEnabled, isScrolling, onTabReselect]
  );

  // インターバル変更ハンドラ
  const handleIntervalChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(event.target.value, 10);
      const option = intervalOptions.find((opt) => opt.value === value);
      if (option) {
        setSelectedIntervalIndex(value);
        setCurrentInterval(option.seconds);
        saveInterval(value);
      }
    },
    [intervalOptions]
  );

  // 初回マウント時にインターバルを復元
  useEffect(() => {
    restoreIntervalSetting();
  }, [restoreIntervalSetting]);

  // インターバル処理の初期化と更新
  useEffect(() => {
    restartInterval(currentInterval);
    return () => {
      if (timerIdRef.current > 0) {
        clearInterval(timerIdRef.current);
      }
    };
  }, [currentInterval, restartInterval]);

  return {
    selectedIntervalIndex,
    handleIntervalChange,
    restoreIntervalSetting,
  };
};
