import { useEffect, useState } from "react";
import AutoReload from "./auto-reload/AutoReload";
import { HeaderCustomizer } from "./header-customizer/HeaderCustomizer";
import { getSettings } from "../shared/settings";

function App() {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setIsEnabled(settings.enabled);
    };
    loadSettings();
  }, []);

  // 全機能が無効の場合は何も表示しない
  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <AutoReload />
      <HeaderCustomizer />
    </>
  );
}

export default App;
