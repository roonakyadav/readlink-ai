// ChatDocs background service worker

console.log("[ChatDocs][background] Service worker initialized");

/**
 * Fetch Google Doc text
 */
async function fetchGoogleDoc(docId) {
  try {

    const url = `https://docs.google.com/document/d/${docId}/export?format=txt`;

    console.log("[ChatDocs][background] Fetching:", url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const text = await res.text();

    if (!text || text.length < 5) {
      throw new Error("Empty document");
    }

    return text;

  } catch (err) {

    console.error("[ChatDocs][background] Fetch failed:", err);

    throw err;
  }
}


/**
 * Message listener
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  console.log("[ChatDocs][background] Message received:", request);

  if (request.action === "FETCH_GOOGLE_DOC") {

    const { docId } = request.payload;

    fetchGoogleDoc(docId)
      .then(text => {

        sendResponse({
          ok: true,
          data: { text }
        });

      })
      .catch(error => {

        sendResponse({
          ok: false,
          error: {
            code: "FETCH_FAILED",
            message: error.message
          }
        });

      });

    return true; // REQUIRED for async response
  }

});