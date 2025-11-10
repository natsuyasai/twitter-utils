import { useCallback, useEffect, useState } from "react";
import type { AppSettings } from "../shared/settings";
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
} from "../shared/settings";
import { INTERVAL_OPTIONS } from "../content-scripts/auto-reload/constants";
import styles from "./App.module.scss";

function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      showMessage("error", "設定の読み込みに失敗しました");
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      showMessage("success", "設定を保存しました");
    } catch (error) {
      showMessage("error", "設定の保存に失敗しました");
      console.error("Failed to save settings:", error);
    }
  };

  const handleReset = async () => {
    if (!confirm("設定を初期値にリセットしますか?")) {
      return;
    }
    try {
      await saveSettings(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      showMessage("success", "設定をリセットしました");
    } catch (error) {
      showMessage("error", "設定のリセットに失敗しました");
      console.error("Failed to reset settings:", error);
    }
  };

  const updateAreaRemove = (
    field: keyof typeof settings.areaRemove,
    value: string | string[]
  ) => {
    setSettings({
      ...settings,
      areaRemove: {
        ...settings.areaRemove,
        [field]: value,
      },
    });
  };

  const updateIntervalTimer = (value: number) => {
    setSettings({
      ...settings,
      intervalTimer: {
        defaultIntervalIndex: value,
      },
    });
  };

  const updateImageSize = (value: string) => {
    setSettings({
      ...settings,
      imageSize: {
        imageWidth: value,
      },
    });
  };

  const updateImageLink = (value: boolean) => {
    setSettings({
      ...settings,
      imageLink: {
        openInIframe: value,
      },
    });
  };

  if (isLoading) {
    return <div className={styles.container}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Twitter Utils 設定</h1>
        <p>拡張機能の動作をカスタマイズできます</p>
      </div>

      <div className={styles.section}>
        <h2>エリア削除設定</h2>
        <p className={styles.description}>
          特定のタブとURLでエリア削除機能を有効にします
          <br />
          指定したURLかつタブ名の場合は通常表示、それ以外ページでは左の領域とツイートメニューを非表示にします
        </p>

        <div className={styles.formGroup}>
          <label>有効なURL</label>
          <textarea
            className={styles.textarea}
            value={settings.areaRemove.enabledUrls.join("\n")}
            onChange={(e) =>
              updateAreaRemove(
                "enabledUrls",
                e.target.value.split("\n").filter((url) => url.trim())
              )
            }
            placeholder="https://x.com/home&#10;https://x.com/notifications"
          />
          <div className={styles.helpText}>1行に1つのURLを入力してください</div>
        </div>

        <div className={styles.formGroup}>
          <label>有効なタブ名</label>
          <textarea
            className={styles.textarea}
            value={settings.areaRemove.enabledTabs.join("\n")}
            onChange={(e) =>
              updateAreaRemove(
                "enabledTabs",
                e.target.value.split("\n").filter((tab) => tab.trim())
              )
            }
            placeholder="フォロー中&#10;main"
          />
          <div className={styles.helpText}>
            1行に1つのタブ名を入力してください
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>自動更新タイマー設定</h2>
        <p className={styles.description}>デフォルトの更新間隔を設定します</p>

        <div className={styles.formGroup}>
          <label>デフォルト更新間隔</label>
          <select
            className={styles.select}
            value={settings.intervalTimer.defaultIntervalIndex}
            onChange={(e) => updateIntervalTimer(Number(e.target.value))}
          >
            {INTERVAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className={styles.helpText}>
            自動更新機能の初期表示時の間隔を設定します
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>画像サイズ設定</h2>
        <p className={styles.description}>
          タイムラインに表示される画像のサイズを設定します
        </p>

        <div className={styles.formGroup}>
          <label>画像の幅</label>
          <input
            type="text"
            className={styles.input}
            value={settings.imageSize.imageWidth}
            onChange={(e) => updateImageSize(e.target.value)}
            placeholder="100px"
          />
          <div className={styles.helpText}>
            CSSの単位を含めて入力してください (例: 100px, 10rem)
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>画像リンク設定</h2>
        <p className={styles.description}>
          画像リンクをiframeで表示する機能を設定します
        </p>

        <div className={styles.formGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.imageLink.openInIframe}
              onChange={(e) => updateImageLink(e.target.checked)}
            />
            <span>iframeで表示を有効にする</span>
          </label>
          <div className={styles.helpText}>
            画像リンクをクリックしたときにiframeで内容を表示します
          </div>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={handleSave}
        >
          設定を保存
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.secondary}`}
          onClick={handleReset}
        >
          初期値にリセット
        </button>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default App;
