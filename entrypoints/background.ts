export default defineBackground(() => {
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: "https://x.com/home" });
  });
});
