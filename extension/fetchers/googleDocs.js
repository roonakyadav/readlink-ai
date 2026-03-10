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

  console.log(`[ReadLinkAI][googleDocs][fetchGoogleDocText] Starting`, { docId });

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

  if (!response || !response.ok) {
    const code = response?.error?.code || "BACKGROUND_ERROR";
    const message = response?.error?.message || "Failed to fetch Google Doc";

    console.warn(`[ReadLinkAI][googleDocs] Background error`, response?.error);

    const err = new Error(message);
    err.code = code;
    err.details = response?.error?.details;
    throw err;
  }

  const text = response?.data?.text || "";
  console.log(`[ReadLinkAI][googleDocs] Raw length`, text.length);

  const sanitizedText = sanitizeText(text);

  // IMPORTANT: Empty docs are NOT errors
  if (isEmptyText(sanitizedText)) {
    console.warn(`[ReadLinkAI][googleDocs] Document is empty`);
    return "";
  }

  const trimmedText = trimText(sanitizedText, 20000);

  console.log(`[ReadLinkAI][googleDocs] Success`, { length: trimmedText.length });

  return trimmedText;
}