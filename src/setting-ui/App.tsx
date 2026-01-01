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

  const updateImageLink = (
    field: keyof typeof settings.imageLink,
    value: boolean
  ) => {
    setSettings({
      ...settings,
      imageLink: {
        ...settings.imageLink,
        [field]: value,
      },
    });
  };

  const updateTabSwitcher = (
    field: keyof typeof settings.tabSwitcher,
    value: boolean | number
  ) => {
    setSettings({
      ...settings,
      tabSwitcher: {
        ...settings.tabSwitcher,
        [field]: value,
      },
    });
  };

  const updateHeaderCustomizer = (label: string, checked: boolean) => {
    const newVisibleLinks = checked
      ? [...settings.headerCustomizer.visibleLinks, label]
      : settings.headerCustomizer.visibleLinks.filter((l) => l !== label);

    setSettings({
      ...settings,
      headerCustomizer: {
        visibleLinks: newVisibleLinks,
      },
    });
  };

  const updateFeatureToggle = (
    feature: keyof typeof settings.features,
    value: boolean
  ) => {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: value,
      },
    });
  };

  const availableLinks = [
    "ホーム",
    "調べたいものを検索",
    "通知",
    "ダイレクトメッセージ",
    "Grok",
    "リスト",
    "ブックマーク",
    "コミュニティ",
    "プレミアム",
    "プロフィール",
    "ポストする",
  ];

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
        <h2>個別機能の有効/無効</h2>
        <p className={styles.description}>
          各機能の有効/無効を個別に設定できます
        </p>

        <div className={styles.formGroup}>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.features.autoReload}
                onChange={(e) =>
                  updateFeatureToggle("autoReload", e.target.checked)
                }
              />
              <span>自動リロード</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.features.imageSize}
                onChange={(e) =>
                  updateFeatureToggle("imageSize", e.target.checked)
                }
              />
              <span>画像サイズ変更</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.features.areaRemove}
                onChange={(e) =>
                  updateFeatureToggle("areaRemove", e.target.checked)
                }
              />
              <span>エリア削除</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.features.imagePopup}
                onChange={(e) =>
                  updateFeatureToggle("imagePopup", e.target.checked)
                }
              />
              <span>画像ポップアップ</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.features.tabSwitcher}
                onChange={(e) =>
                  updateFeatureToggle("tabSwitcher", e.target.checked)
                }
              />
              <span>タブスイッチャー</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.features.scrollRestore}
                onChange={(e) =>
                  updateFeatureToggle("scrollRestore", e.target.checked)
                }
              />
              <span>スクロール位置復元</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.features.headerCustomizer}
                onChange={(e) =>
                  updateFeatureToggle("headerCustomizer", e.target.checked)
                }
              />
              <span>ヘッダーカスタマイズ</span>
            </label>
          </div>
          <div className={styles.helpText}>
            チェックを外した機能は無効になります
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>エリア削除設定</h2>
        <p className={styles.description}>
          特定のタブとURLでエリア削除機能を有効にします
          <br />
          指定したURLかつタブ名の場合は通常表示、それ以外ページでは左の領域とツイートメニューを非表示にします
        </p>

        <div className={styles.formGroup}>
          <label>要素の削除判定を行うページ</label>
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
          <label>要素の削除を行わないタブ名</label>
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
          画像リンクをクリックしたときの動作を設定します
        </p>

        <div className={styles.formGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.imageLink.openInIframe}
              onChange={(e) =>
                updateImageLink("openInIframe", e.target.checked)
              }
            />
            <span>ポップアップ表示を行う</span>
          </label>
          <div className={styles.helpText}>
            画像をクリックしたときにポップアップ上で表示します
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>タブスイッチャー設定</h2>
        <p className={styles.description}>
          スワイプジェスチャーでタブを切り替える機能を設定します
        </p>

        <div className={styles.formGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.tabSwitcher.enabled}
              onChange={(e) => updateTabSwitcher("enabled", e.target.checked)}
            />
            <span>スワイプでタブ切り替えを有効にする</span>
          </label>
          <div className={styles.helpText}>
            左スワイプで次のタブ、右スワイプで前のタブに移動します
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>スワイプ感度（最小移動距離）</label>
          <input
            type="number"
            className={styles.input}
            value={settings.tabSwitcher.swipeThreshold}
            onChange={(e) =>
              updateTabSwitcher("swipeThreshold", Number(e.target.value))
            }
            disabled={!settings.tabSwitcher.enabled}
            min="50"
            max="300"
            step="10"
          />
          <div className={styles.helpText}>
            スワイプと認識する最小移動距離をピクセル単位で設定します（推奨:
            100px）
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>ヘッダーカスタマイズ設定</h2>
        <p className={styles.description}>
          画面下部に表示するナビゲーションリンクを選択します
        </p>

        <div className={styles.formGroup}>
          <label>表示するリンク</label>
          <div className={styles.checkboxGroup}>
            {availableLinks.map((link) => (
              <label key={link} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={settings.headerCustomizer.visibleLinks.includes(
                    link
                  )}
                  onChange={(e) =>
                    updateHeaderCustomizer(link, e.target.checked)
                  }
                />
                <span>{link}</span>
              </label>
            ))}
          </div>
          <div className={styles.helpText}>
            チェックしたリンクが画面下部のナビゲーションバーに表示されます
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
