import { useState, useCallback, useEffect, useRef } from "react";
import { getStoredInterval, saveInterval } from "../storage";
import {
  FOLLOWING_TAB_MIN_INTERVAL_SEC,
  FOLLOWING_TAB_MIN_OPTION_VALUE,
} from "../constants";
import { isFollowingTabActive, triggerFollowingRefresh } from "../utils";

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
  const [selectedIntervalIndex, setSelectedIntervalIndex] = useState(() =>
    getStoredInterval(intervalOptions.length)
  );
  const [currentInterval, setCurrentInterval] = useState(() => {
    const storedIndex = getStoredInterval(intervalOptions.length);
    const option = intervalOptions.find((opt) => opt.value === storedIndex);
    return option ? option.seconds : defaultInterval;
  });
  const [disabledOptionValues, setDisabledOptionValues] = useState<number[]>(
    []
  );
  const timerIdRef = useRef<number>(-1);
  const followingTabTimerIdRef = useRef<number>(-1);

  // インターバル設定を復元する関数
  const restoreIntervalSetting = useCallback(() => {
    const storedIndex = getStoredInterval(intervalOptions.length);
    const option = intervalOptions.find((opt) => opt.value === storedIndex);
    if (option) {
      setSelectedIntervalIndex(storedIndex);
      setCurrentInterval(option.seconds);
    }
  }, [intervalOptions]);

  // フォロー中タブの状態に応じて選択肢を更新する
  const updateIntervalSettingForTab = useCallback(() => {
    const onFollowing = isFollowingTabActive();
    if (onFollowing) {
      const disabled = intervalOptions
        .filter((opt) => opt.value < FOLLOWING_TAB_MIN_OPTION_VALUE)
        .map((opt) => opt.value);
      setDisabledOptionValues(disabled);
      setSelectedIntervalIndex((prev) => {
        if (prev < FOLLOWING_TAB_MIN_OPTION_VALUE) {
          const minOption = intervalOptions.find(
            (opt) => opt.value === FOLLOWING_TAB_MIN_OPTION_VALUE
          );
          if (minOption) {
            setCurrentInterval(minOption.seconds);
            saveInterval(FOLLOWING_TAB_MIN_OPTION_VALUE);
          }
          return FOLLOWING_TAB_MIN_OPTION_VALUE;
        }
        return prev;
      });
    } else {
      setDisabledOptionValues([]);
    }
  }, [intervalOptions]);

  // フォロー中タブ専用の更新タイマー開始
  const startFollowingTabInterval = useCallback(
    (intervalSeconds: number) => {
      if (followingTabTimerIdRef.current > 0) {
        clearInterval(followingTabTimerIdRef.current);
      }
      const effectiveInterval = Math.max(
        FOLLOWING_TAB_MIN_INTERVAL_SEC,
        intervalSeconds
      );
      followingTabTimerIdRef.current = window.setInterval(() => {
        if (isStopped || isScrolling() || !isEnabled) return;
        if (isFollowingTabActive()) {
          triggerFollowingRefresh();
        }
      }, 1000 * effectiveInterval);
    },
    [isStopped, isEnabled, isScrolling]
  );

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
      startFollowingTabInterval(intervalSeconds);
    },
    [isStopped, isEnabled, isScrolling, onTabReselect, startFollowingTabInterval]
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

  // インターバル処理の初期化と更新
  useEffect(() => {
    restartInterval(currentInterval);
    return () => {
      if (timerIdRef.current > 0) {
        clearInterval(timerIdRef.current);
      }
      if (followingTabTimerIdRef.current > 0) {
        clearInterval(followingTabTimerIdRef.current);
      }
    };
  }, [currentInterval, restartInterval]);

  return {
    selectedIntervalIndex,
    disabledOptionValues,
    handleIntervalChange,
    restoreIntervalSetting,
    updateIntervalSettingForTab,
  };
};
