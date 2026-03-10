// Prompt interceptor and rewriter module
// Depends on: linkDetector.js (detectGoogleDocsLink), fetchers/googleDocs.js (fetchGoogleDocText)

/**
 * Processes a prompt to detect and replace Google Docs links with their content
 * @param {string} originalPrompt - The original user prompt
 * @returns {Promise<string>} Processed prompt with document content injected
 */
async function processPrompt(originalPrompt) {
  console.log(`[ChatDocs][promptInterceptor][processPrompt] Starting (${originalPrompt.length} chars)`);
  console.log(`[ChatDocs][promptInterceptor][processPrompt] Preview: "${originalPrompt.substring(0, 150)}..."`);
  
  // Check for Google Docs link
  console.log(`[ChatDocs][promptInterceptor][detect] Calling detectGoogleDocsLink()...`);
  const docId = detectGoogleDocsLink(originalPrompt);
  
  if (!docId) {
    console.log("[ChatDocs][promptInterceptor][detect] No Google Docs link detected");
    return originalPrompt;
  }
  
  console.log(`[ChatDocs][promptInterceptor][detect] Detected doc ID: ${docId}`);
  
  try {
    // Fetch the document content
    console.log(`[ChatDocs][promptInterceptor][fetch] Calling fetchGoogleDocText("${docId}")...`);
    const docContent = await fetchGoogleDocText(docId);
    console.log(`[ChatDocs][promptInterceptor][fetch] Returned (${docContent.length} chars)`);
    
    // Remove the Google Docs link from the original prompt to avoid confusion
    const promptWithoutLink = (typeof removeGoogleDocsLinks === "function")
      ? removeGoogleDocsLinks(originalPrompt)
      : originalPrompt.replace(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/g, "").replace(/\s+/g, " ").trim();
    
    // Construct the new prompt - put content FIRST, then question
    const rewrittenPrompt = `${promptWithoutLink}

--- BEGIN GOOGLE DOC CONTENT ---

${docContent}

--- END GOOGLE DOC CONTENT ---`;
    
    console.log(`[ChatDocs][promptInterceptor][rewrite] Success (${rewrittenPrompt.length} chars)`);
    return rewrittenPrompt;
    
  } catch(error) {
    const code = error?.code || "UNKNOWN";
    const message = error?.message || "Failed to process Google Doc";
    console.error(`[ChatDocs][promptInterceptor][error] ${code}: ${message}`, error?.details || "");

    // User-readable message injected into the prompt (graceful private-doc handling).
    const friendly =
      code === "DOC_NOT_PUBLIC"
        ? "This Google Doc appears private. Change sharing to 'Anyone with the link can view' and try again."
        : code === "DOC_NOT_FOUND"
          ? "This Google Doc link looks invalid or the document was not found."
          : code === "BACKGROUND_TIMEOUT"
            ? "ChatDocs timed out while fetching the Google Doc. Please try again."
            : "ChatDocs couldn't fetch the Google Doc. Please try again or paste the text directly.";

    return `[ChatDocs Error: ${code}] ${friendly}\n\n${originalPrompt}`;
  }
}
