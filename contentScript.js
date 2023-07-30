//this file operates in the context of the webpage - i.e what webpage we are on;

(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  //fetching past bookmarks from Chrome storage;
  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    //gives current timestamp of the video;
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };

    //fetching past bookmarks;
    currentVideoBookmarks = await fetchBookmarks();

    //accessing Chrome Storage API & appending the new bookmark;
    //key:value pair;
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };

  const newVideoLoaded = async () => {
    //checking if bookmark button already exists;
    const bookmarkBtnExists =
      document.getElementsByClassName("bookmark-btn")[0];

    //fetching past bookmarks;
    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      //create bookmark button;
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      //selecting youTube controls on the bottom;
      youtubeLeftControls =
        document.getElementsByClassName("ytp-left-controls")[0];
      console.log(youtubeLeftControls);
      youtubePlayer = document.getElementsByClassName("video-stream")[0];

      //attaching bookmark button to the control section;
      youtubeLeftControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  //accessing Chrome API;
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      //new video loaded;
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => b.time != value
      );
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });

      response(currentVideoBookmarks);
    }
  });

  //so that bookmark button renders even upon page reload;
  newVideoLoaded();
})();

const getTime = (t) => {
  var date = new Date(0);
  date.setSeconds(t);

  console.log(date.toISOString());
  return date.toISOString().substr(11, 8);
};
