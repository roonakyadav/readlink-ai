// Link detection module for supported platforms

/**
 * Detects Google Docs links in text
 * @param {string} text - Text to search for links
 * @returns {string|null} Document ID if found, null otherwise
 */
function detectGoogleDocsLink(text) {
  console.log(`[ChatDocs][linkDetector][detectGoogleDocsLink] Checking (${text ? text.length : 0} chars)`);
  if (!text) {
    console.log(`[ChatDocs][linkDetector][detectGoogleDocsLink] Input is empty/null`);
    return null;
  }
  
  // Pattern: https://docs.google.com/document/d/<DOC_ID>
  // Handles various formats: /d/ID, /d/ID/edit, /d/ID/view
  const googleDocsPattern = /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)(?:\/[a-z]+)?/g;
  const matches = [...text.matchAll(googleDocsPattern)];
  console.log(`[ChatDocs][linkDetector][detectGoogleDocsLink] Regex found ${matches.length} match(es)`);
  
  if (matches.length > 0) {
    const docId = matches[0][1];
    console.log(`[ChatDocs][linkDetector][detectGoogleDocsLink] Detected ID: ${docId}`);
    if (matches.length > 1) {
      console.log(`[ChatDocs][linkDetector][detectGoogleDocsLink] Multiple links found, using first. All IDs:`, matches.map(m => m[1]));
    }
    return docId;
  }
  
  console.log(`[ChatDocs][linkDetector][detectGoogleDocsLink] No Google Docs link found`);
  return null;
}

/**
 * Removes Google Docs links from text
 * @param {string} text - Original text
 * @returns {string} Text with links removed
 */
function removeGoogleDocsLinks(text) {
  console.log(`[ChatDocs][linkDetector][removeGoogleDocsLinks] Removing links (${text ? text.length : 0} chars)`);
  if (!text) return text;
  
  // Remove full URLs with any suffix (/edit, /view, etc)
  const googleDocsPattern = /https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+(?:\/[a-z]+)?/g;
  const result = text.replace(googleDocsPattern, "").replace(/\s+/g, " ").trim();
  console.log(`[ChatDocs][linkDetector][removeGoogleDocsLinks] Result: ${result.length} chars`);
  return result;
}
