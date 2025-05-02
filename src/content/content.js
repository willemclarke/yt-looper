// Content script for YouTube Looper
const MESSAGE = {
  SET_LOOP: "SET_LOOP",
  RELEASE_LOOP: "RELEASE_LOOP",
};

let loopInterval = null;
let loopStart = null;
let loopEnd = null;

function getYouTubePlayer() {
  return document.querySelector("video");
}

function clearLooper() {
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
}

function startLooper(start, end) {
  clearLooper();
  loopStart = start;
  loopEnd = end;
  const player = getYouTubePlayer();
  if (!player) return;
  // Seek to start if current time is outside loop
  if (player.currentTime < start || player.currentTime > end) {
    player.currentTime = start;
  }
  loopInterval = setInterval(() => {
    if (player.currentTime >= loopEnd) {
      player.currentTime = loopStart;
      player.play();
    }
  }, 300);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case MESSAGE.SET_LOOP: {
      const { start, end } = msg;
      startLooper(start, end);
      sendResponse({ status: "ok" });
      break;
    }
    case MESSAGE.RELEASE_LOOP: {
      clearLooper();
      loopStart = null;
      loopEnd = null;
      sendResponse({ status: "released" });
      break;
    }
    default:
      break;
  }
});
