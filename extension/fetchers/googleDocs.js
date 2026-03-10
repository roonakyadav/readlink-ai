// Google Docs content fetcher
// Uses background service worker to bypass CORS
// Depends on: utils/textUtils.js (trimText, sanitizeText, isEmptyText)
// Depends on: utils/messaging.js (sendMessageWithTimeout)

/**
 * Fetches text content from a Google Doc
 * @param {string} docId - Google Document ID
 * @returns {Promise<string>} Document text content
 */
async function fetchGoogleDocText(docId) {

  console.log(`[ChatDocs][googleDocs][fetchGoogleDocText] Starting`, { docId });

  const response = await sendMessageWithTimeout(
    {
      action: "FETCH_GOOGLE_DOC",
      payload: { docId }
    },
    {
      module: "googleDocs",
      timeoutMs: 20000,
      retries: 3,
      retryDelayMs: 400
    }
  );

  if (!response.ok) {
    const code = response?.error?.code || "BACKGROUND_ERROR";
    const message = response?.error?.message || "Failed to fetch Google Doc";
    console.error(`[ChatDocs][googleDocs][fetchGoogleDocText] Background error`, response?.error);
    const err = new Error(message);
    err.code = code;
    err.details = response?.error?.details;
    throw err;
  }

  const text = response?.data?.text || "";
  console.log(`[ChatDocs][googleDocs][fetchGoogleDocText] Raw length`, text.length);

  const sanitizedText = sanitizeText(text);
  if (isEmptyText(sanitizedText)) {
    const err = new Error("Google Doc export returned empty text");
    err.code = "PARSE_ERROR";
    throw err;
  }

  const trimmedText = trimText(sanitizedText, 20000);
  console.log(`[ChatDocs][googleDocs][fetchGoogleDocText] Success`, { length: trimmedText.length });
  return trimmedText;
}