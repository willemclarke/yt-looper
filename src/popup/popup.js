const MESSAGE = {
  SET_LOOP: "SET_LOOP",
  RELEASE_LOOP: "RELEASE_LOOP",
};

const STORAGE_KEY_START = "yt-loop-start";
const STORAGE_KEY_END = "yt-loop-end";

function getStorage() {
  return {
    start: window.localStorage.getItem(STORAGE_KEY_START),
    end: window.localStorage.getItem(STORAGE_KEY_END),
  };
}

function clearStorage() {
  window.localStorage.removeItem(STORAGE_KEY_START);
  window.localStorage.removeItem(STORAGE_KEY_END);
}

document.addEventListener("DOMContentLoaded", () => {
  // Restore saved values from localStorage
  const { start, end } = getStorage();
  if (start) document.getElementById("start-time").value = start;
  if (end) document.getElementById("end-time").value = end;

  document
    .getElementById("looper-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const start = document.getElementById("start-time").value.trim();
      const end = document.getElementById("end-time").value.trim();
      const status = document.getElementById("status");

      function timeToSeconds(str) {
        const parts = str.split(":").map(Number);
        if (parts.some(isNaN) || parts.some((n) => n < 0)) return null;
        if (parts.length === 3) {
          // hh:mm:ss
          const [hh, mm, ss] = parts;
          if (mm > 59 || ss > 59) return null;
          return hh * 3600 + mm * 60 + ss;
        } else if (parts.length === 2) {
          // mm:ss
          const [mm, ss] = parts;
          if (ss > 59) return null;
          return mm * 60 + ss;
        } else {
          return null;
        }
      }

      const startSeconds = timeToSeconds(start);
      const endSeconds = timeToSeconds(end);

      if (
        startSeconds === null ||
        endSeconds === null ||
        startSeconds >= endSeconds
      ) {
        status.textContent =
          "Invalid input. Ensure mm:ss or hh:mm:ss format and start < end.";
        status.style.color = "red";
        return;
      }

      // Save values to localStorage
      window.localStorage.setItem(STORAGE_KEY_START, start);
      window.localStorage.setItem(STORAGE_KEY_END, end);

      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: MESSAGE.SET_LOOP,
            start: startSeconds,
            end: endSeconds,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              status.textContent = "Could not communicate with YouTube tab.";
              status.style.color = "red";
            } else {
              status.textContent = "Loop set!";
              status.style.color = "green";
            }
          }
        );
      });
    });

  // Release button logic
  document.getElementById("release-btn").addEventListener("click", () => {
    // Clear form values
    document.getElementById("start-time").value = "";
    document.getElementById("end-time").value = "";

    // Clear localStorage
    clearStorage();

    // Send message to content script to stop looping
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: MESSAGE.RELEASE_LOOP },
        () => {
          document.getElementById("status").textContent = "Loop released.";
          document.getElementById("status").style.color = "#333";
        }
      );
    });
  });
});
