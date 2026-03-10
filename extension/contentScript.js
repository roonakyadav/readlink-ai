// Content script for ChatDocs extension
// Intercepts ChatGPT prompt submissions and processes Google Docs links

function log(step, ...args) {
  console.log(`[ChatDocs][contentScript][${step}]`, ...args);
}

function warn(step, ...args) {
  console.warn(`[ChatDocs][contentScript][${step}]`, ...args);
}

function err(step, ...args) {
  console.error(`[ChatDocs][contentScript][${step}]`, ...args);
}

log("init", { url: window.location.href });

// Global lock to prevent duplicate processing.
// Also stored on window so navigation/reattach doesn't duplicate in the same tab lifecycle.
if (typeof window.__chatdocsIsProcessing !== "boolean") window.__chatdocsIsProcessing = false;

const EDITOR_SELECTORS = ["#prompt-textarea", ".ProseMirror", '[contenteditable="true"]'];
const SEND_SELECTORS = [
  'button[aria-label="Send message"]',
  'button[data-testid="send-button"]',
  'button[aria-label*="Send"]',
  'button svg[data-icon="send"]',
  'button svg[aria-label*="Send"]'
];

function findEditor() {
  for (const sel of EDITOR_SELECTORS) {
    const el = document.querySelector(sel);
    if (!el) continue;
    if (sel === '[contenteditable="true"]') {
      // Avoid grabbing random contenteditables (e.g., rename chat title).
      const aria = (el.getAttribute("aria-label") || "").toLowerCase();
      const role = (el.getAttribute("role") || "").toLowerCase();
      if (aria.includes("message") || aria.includes("prompt") || role === "textbox") return el;
      continue;
    }
    return el;
  }
  return null;
}

function getEditorText(editor) {
  // ChatGPT editor can be <textarea> or contenteditable.
  if (!editor) return "";
  if ("value" in editor) return String(editor.value || "");
  return String(editor.innerText || "");
}

function setEditorText(editor, text) {
  if (!editor) return;
  if ("value" in editor) {
    editor.value = text;
  } else {
    editor.innerText = text;
  }
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

function findSendButton() {
  for (const sel of SEND_SELECTORS) {
    const el = document.querySelector(sel);
    if (!el) continue;
    if (el.tagName?.toLowerCase() === "button") return el;
    const btn = el.closest?.("button");
    if (btn) return btn;
  }
  return null;
}

async function clickSendOrEnter(editor) {
  const btn = findSendButton();
  if (btn) {
    btn.click();
    log("send", "Clicked send button");
    return;
  }
  warn("sendFallback", "Send button not found, dispatching Enter");
  editor.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true
    })
  );
}

function shouldIntercept(promptText) {
  if (!promptText) return false;
  // Avoid reprocessing an already-injected prompt.
  if (promptText.includes("--- BEGIN GOOGLE DOC CONTENT ---")) return false;
  return /https:\/\/docs\.google\.com\/document\/d\//.test(promptText);
}

function attachListener(editor) {
  if (!editor) return;
  if (editor.dataset && editor.dataset.chatdocsListenerAttached === "1") return;
  if (editor.dataset) editor.dataset.chatdocsListenerAttached = "1";

  log("attachListener", { editor: editor.tagName, id: editor.id, className: editor.className });

  editor.addEventListener(
    "keydown",
    async (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      if (window.__chatdocsIsProcessing) {
        log("skip", "Already processing");
        return;
      }

      const promptText = getEditorText(editor).trim();
      log("enter", { preview: promptText.slice(0, 120) });

      if (!shouldIntercept(promptText)) return;

      event.preventDefault();
      event.stopPropagation();

      window.__chatdocsIsProcessing = true;
      try {
        const processedPrompt = await processPrompt(promptText);
        setEditorText(editor, processedPrompt);
        log("rewrite", { length: processedPrompt.length });

        // Let UI react before sending.
        setTimeout(() => {
          clickSendOrEnter(editor)
            .catch((e) => err("sendError", e))
            .finally(() => {
              window.__chatdocsIsProcessing = false;
            });
        }, 150);
      } catch (e) {
        err("processError", e);
        window.__chatdocsIsProcessing = false;
      }
    },
    true
  );
}

async function ensureAttachedLoop() {
  const editor = findEditor();
  if (editor) {
    attachListener(editor);
    return;
  }
  // Retry every 1s until found (defensive against SPA navigation + DOM changes).
  setTimeout(ensureAttachedLoop, 1000);
}

function installMutationObserver() {
  const root = document.documentElement || document.body;
  if (!root) return;

  if (window.__chatdocsObserverInstalled) return;
  window.__chatdocsObserverInstalled = true;

  const obs = new MutationObserver(() => {
    const editor = findEditor();
    if (editor) attachListener(editor);
  });
  obs.observe(root, { childList: true, subtree: true });
  log("observer", "MutationObserver installed");
}

installMutationObserver();
ensureAttachedLoop();