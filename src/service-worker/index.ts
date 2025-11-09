chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "https://x.com/" });
});
