// Messaging utilities for ChatDocs (MV3-safe)

/**
 * @typedef {{code: string, message: string, details?: any}} ChatDocsError
 * @typedef {{ok: true, data: any, requestId: string} | {ok: false, error: ChatDocsError, requestId: string}} ChatDocsResponse
 */

function chatdocsLog(module, step, ...args) {
  // Centralized log format: [ChatDocs][module][step]
  console.log(`[ChatDocs][${module}][${step}]`, ...args);
}

function chatdocsWarn(module, step, ...args) {
  console.warn(`[ChatDocs][${module}][${step}]`, ...args);
}

function chatdocsError(module, step, ...args) {
  console.error(`[ChatDocs][${module}][${step}]`, ...args);
}

function makeRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Send a message to the extension service worker with timeout + retry.
 *
 * This hardens against:
 * - background sleeping / not yet awake
 * - "Could not establish connection. Receiving end does not exist"
 * - missing responses (buggy listeners) -> timeout
 *
 * @param {{action: string, payload?: any}} message
 * @param {{timeoutMs?: number, retries?: number, retryDelayMs?: number, module?: string}} options
 * @returns {Promise<ChatDocsResponse>}
 */
async function sendMessageWithTimeout(message, options = {}) {
  const module = options.module || "messaging";
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 15000;
  const retries = Number.isFinite(options.retries) ? options.retries : 3;
  const retryDelayMs = Number.isFinite(options.retryDelayMs) ? options.retryDelayMs : 350;

  const requestId = makeRequestId();
  const fullMessage = { ...message, requestId };

  for (let attempt = 1; attempt <= retries; attempt++) {
    chatdocsLog(module, "sendMessage", { action: message.action, requestId, attempt });

    const response = await new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({
          ok: false,
          requestId,
          error: { code: "BACKGROUND_TIMEOUT", message: "Timed out waiting for background response" }
        });
      }, timeoutMs);

      try {
        chrome.runtime.sendMessage(fullMessage, (resp) => {
          const lastErr = chrome.runtime.lastError;
          clearTimeout(timer);
          if (settled) return;
          settled = true;

          if (lastErr) {
            resolve({
              ok: false,
              requestId,
              error: { code: "BACKGROUND_UNREACHABLE", message: lastErr.message || "Background unreachable" }
            });
            return;
          }

          if (!resp) {
            resolve({
              ok: false,
              requestId,
              error: { code: "BACKGROUND_NO_RESPONSE", message: "No response from background" }
            });
            return;
          }

          resolve(resp);
        });
      } catch (e) {
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        resolve({
          ok: false,
          requestId,
          error: { code: "BACKGROUND_UNREACHABLE", message: String(e?.message || e || "Background unreachable") }
        });
      }
    });

    if (response && response.ok) return response;

    const code = response?.error?.code || "UNKNOWN";
    chatdocsWarn(module, "sendMessageFailed", { requestId, attempt, code, error: response?.error });

    // Retry only for background-transport failures/timeouts.
    const retryable = new Set([
      "BACKGROUND_TIMEOUT",
      "BACKGROUND_UNREACHABLE",
      "BACKGROUND_NO_RESPONSE"
    ]);

    if (attempt < retries && retryable.has(code)) {
      await sleep(retryDelayMs * attempt);
      continue;
    }

    return response;
  }

  return {
    ok: false,
    requestId,
    error: { code: "BACKGROUND_UNREACHABLE", message: "Failed to reach background" }
  };
}

