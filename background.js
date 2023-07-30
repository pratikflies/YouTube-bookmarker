//accessing chrome.tabs API;
//checks if URL is updated;
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  //YouTube link format: https://www.youtube.com/watch?v=0n809nd4Zu4&ab;
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    //v=0n809nd4Zu4&ab;
    const urlParameters = new URLSearchParams(queryParameters);

    //sending message to contentScript that new video has loaded;
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      //0n809nd4Zu4&ab;
      videoId: urlParameters.get("v"),
    });
  }
});
