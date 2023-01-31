chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("https://my.ucf.edu/")) {  
    console.log("HITTTTT");
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
    });
  }
});