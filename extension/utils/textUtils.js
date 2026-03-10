// Utility functions for text processing

/**
 * Trims text to maximum character limit
 * @param {string} text - Text to trim
 * @param {number} maxChars - Maximum characters allowed
 * @returns {string} Trimmed text
 */
function trimText(text, maxChars = 20000) {
  console.log(`[ChatDocs][textUtils][trimText] Input: ${text ? text.length : 0} chars, maxChars: ${maxChars}`);
  if (!text || text.length <= maxChars) {
    console.log(`[ChatDocs][textUtils][trimText] No trimming needed`);
    return text;
  }
  
  console.log(`[ChatDocs][textUtils][trimText] Trimming text from ${text.length} to ${maxChars} characters`);
  return text.substring(0, maxChars) + "\n\n[Content truncated due to length...]";
}

/**
 * Sanitizes text by removing potentially harmful content
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  console.log(`[ChatDocs][textUtils][sanitizeText] Input: ${text ? text.length : 0} chars`);
  if (!text) {
    console.log(`[ChatDocs][textUtils][sanitizeText] Input is empty/null, returning empty string`);
    return "";
  }
  
  // Remove null bytes and normalize whitespace
  const result = text
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
  console.log(`[ChatDocs][textUtils][sanitizeText] Output: ${result.length} chars`);
  return result;
}

/**
 * Checks if text appears to be empty or mostly whitespace
 * @param {string} text - Text to check
 * @returns {boolean} True if text is effectively empty
 */
function isEmptyText(text) {
  const result = !text || text.trim().length === 0;
  console.log(`[ChatDocs][textUtils][isEmptyText] Input: ${text ? text.length : 0} chars → isEmpty: ${result}`);
  return result;
}
