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
  if (msg.action === "SET_LOOP") {
    const { start, end } = msg;
    startLooper(start, end);
    sendResponse({ status: "ok" });
  } else if (msg.action === "RELEASE_LOOP") {
    clearLooper();
    loopStart = null;
    loopEnd = null;
    sendResponse({ status: "released" });
  }
});
