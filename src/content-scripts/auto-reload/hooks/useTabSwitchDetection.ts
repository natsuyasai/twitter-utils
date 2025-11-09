import { useEffect } from "react";

interface UseTabSwitchDetectionProps {
  onTabSwitch: () => void;
}

export const useTabSwitchDetection = ({ onTabSwitch }: UseTabSwitchDetectionProps) => {
  useEffect(() => {
    const tabElements = document.body.querySelectorAll("a[role='tab']");

    const handleTabClick = () => {
      // タブクリック後、少し遅延させて設定を復元（タブ切り替え完了を待つ）
      setTimeout(() => {
        onTabSwitch();
      }, 300);
    };

    // すべてのタブ要素にクリックイベントリスナーを追加
    tabElements.forEach((tab) => {
      tab.addEventListener("click", handleTabClick);
    });

    return () => {
      // クリーンアップ
      tabElements.forEach((tab) => {
        tab.removeEventListener("click", handleTabClick);
      });
    };
  }, [onTabSwitch]);
};
