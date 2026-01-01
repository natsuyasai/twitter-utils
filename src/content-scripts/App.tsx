import { useEffect, useState } from "react";
import AutoReload from "./auto-reload/AutoReload";
import { HeaderCustomizer } from "./header-customizer/HeaderCustomizer";
import { getSettings } from "../shared/settings";
import type { AppSettings } from "../shared/settings/types";

function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
    };
    loadSettings();
  }, []);

  // 設定がまだ読み込まれていない、または全機能が無効の場合は何も表示しない
  if (!settings || !settings.enabled) {
    return null;
  }

  return (
    <>
      {settings.features.autoReload && <AutoReload />}
      {settings.features.headerCustomizer && <HeaderCustomizer />}
    </>
  );
}

export default App;
