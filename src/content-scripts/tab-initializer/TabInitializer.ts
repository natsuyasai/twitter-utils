/**
 * URL parameter-based tab selection
 * When opened with URL like "https://x.com/home?TabName", selects that tab
 */

import { getSettings } from "../../shared/settings";

/**
 * Check if URL is valid
 */
function isEnableURL(): boolean {
  return location.href.indexOf("https://x.com/home") === 0;
}

/**
 * Get tab name from URL parameter
 * Example: "https://x.com/home?おすすめ" -> "おすすめ"
 */
function getTabNameFromURL(): string | null {
  const url = new URL(location.href);
  const params = url.searchParams;

  // Support format: "https://x.com/home?TabName"
  // In URLSearchParams, first key is treated as tab name
  const firstKey = Array.from(params.keys())[0];

  if (firstKey && !params.get(firstKey)) {
    // If value is empty, the key itself is the tab name
    return firstKey;
  }

  return null;
}

/**
 * Find and click tab element corresponding to tab name
 */
function selectTab(tabName: string): boolean {
  // Find tabs on home screen
  const tabs = document.querySelectorAll<HTMLElement>(
    'div[role="tablist"] a[role="tab"]'
  );

  for (const tab of tabs) {
    const span = tab.querySelector("span");
    if (span && span.textContent === tabName) {
      // Click the tab
      tab.click();
      console.log(`[TabInitializer] Selected tab "${tabName}"`);
      return true;
    }
  }

  console.warn(`[TabInitializer] Tab "${tabName}" not found`);
  return false;
}

/**
 * Tab initialization process
 */
async function initializeTab(): Promise<void> {
  // Check if extension is enabled
  const settings = await getSettings();
  if (!settings.enabled) {
    return;
  }

  if (!isEnableURL()) {
    return;
  }

  const tabName = getTabNameFromURL();
  if (!tabName) {
    return;
  }

  // Wait for tablist to load
  const observer = new MutationObserver(() => {
    const tablist = document.querySelector('div[role="tablist"]');
    if (tablist) {
      observer.disconnect();

      // Select tab
      if (!selectTab(tabName)) {
        // If tab not found, retry after a short delay
        setTimeout(() => {
          selectTab(tabName);
        }, 1000);
      }
    }
  });

  // If tablist already exists, execute immediately
  if (document.querySelector('div[role="tablist"]')) {
    if (!selectTab(tabName)) {
      // If tab not found, retry after a short delay
      setTimeout(() => {
        selectTab(tabName);
      }, 1000);
    }
  } else {
    // If tablist not found, start monitoring
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 5000);
  }
}

// Initialize
initializeTab();

// Monitor URL changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    initializeTab();
  }
}).observe(document.body, {
  childList: true,
  subtree: true,
});
