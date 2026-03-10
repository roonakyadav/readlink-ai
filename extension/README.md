# ChatDocs - Phase 1 Testing Guide

## How to Test the Extension

### 1. Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `/extension` folder from this project

### 2. Test with a Public Google Doc

**Important:** Use a document with **"Anyone with the link can view"** permissions.

#### Create a Test Document:
1. Go to Google Docs
2. Create a new document with some test text
3. Click "Share" → "Anyone with the link" → "Viewer"
4. Copy the link

#### Test the Extension:
1. Go to https://chat.openai.com/
2. Open browser console (F12 → Console tab)
3. Type a prompt like:
   ```
   Summarize this https://docs.google.com/document/d/YOUR_DOC_ID_HERE
   ```
4. Press Enter
5. Watch the console for `[ChatDocs]` logs

### Expected Behavior

✅ **If the document is PUBLIC:**
- You'll see logs like:
  ```
  [ChatDocs] Content script loaded on chat.openai.com
  [ChatDocs] Enter key detected, prompt length: 85
  [ChatDocs] Detected Google Docs link with ID: YOUR_DOC_ID
  [ChatDocs] Fetching Google Doc: YOUR_DOC_ID
  [ChatDocs] Successfully fetched Google Doc (1234 chars)
  [ChatDocs] Prompt rewritten with document content
  [ChatDocs] Successfully replaced prompt text
  ```
- The textarea will show your question + the full document content
- The message will be sent automatically to ChatGPT
- ChatGPT will respond based on the injected document content

❌ **If the document is PRIVATE:**
- You'll see:
  ```
  [ChatDocs] Error fetching Google Doc: HTTP error! status: 401
  ```
- The prompt will show an error message asking you to fix sharing settings

### Debugging Tips

**Check if extension is loaded:**
- Look for "[ChatDocs] Content script loaded" in console when you open ChatGPT

**Check if it detects links:**
- Type a Google Docs link in the textarea
- Watch for "Detected Google Docs link with ID" in console

**Check if it's fetching:**
- Look for "Fetching Google Doc: [ID]" log
- If you see "HTTP error! status: 401" → document is private

**Check if it's replacing:**
- After pressing Enter, watch for "Successfully replaced prompt text"
- The textarea should update with the document content before sending

### Troubleshooting

**No logs appearing?**
- Make sure you're on https://chat.openai.com/
- Check if extension is enabled in chrome://extensions/
- Try reloading the ChatGPT page

**Getting 401 errors?**
- The document is private
- Change sharing to "Anyone with the link can view"
- Or use the error message that appears in the prompt

**Prompt not being replaced?**
- Check console for errors
- Make sure you're pressing Enter (not clicking Send button)
- The extension only intercepts Enter key submissions

### Example Test Prompts

```
Summarize this https://docs.google.com/document/d/1ABC123xyz
```

```
What are the main points in this doc? https://docs.google.com/document/d/1ABC123xyz
```

```
Extract key information from https://docs.google.com/document/d/1ABC123xyz
```

### What Gets Sent to ChatGPT

**Your input:**
```
Summarize this https://docs.google.com/document/d/1ABC123xyz
```

**What actually gets sent (if successful):**
```
Summarize this

--- BEGIN GOOGLE DOC CONTENT ---

[Full document text here, up to 20,000 characters]

--- END GOOGLE DOC CONTENT ---
```

Notice the link is removed - ChatGPT doesn't need it since we've already extracted the content!

### Performance Expectations

- Link detection: Instant (<10ms)
- Document fetch: 1-3 seconds (depends on document size)
- Prompt replacement: <1 second
- Total delay: Usually 2-4 seconds before message is sent

---

## Known Limitations

1. **Private documents** - Must have "Anyone with the link" access
2. **Very large documents** - Truncated to 20,000 characters
3. **Enter key only** - Doesn't intercept Send button clicks (yet)
4. **Single link** - Only processes the first Google Docs link found

## Next Steps (Future Phases)

- Support for Notion pages
- YouTube transcript extraction
- PDF parsing
- Multiple link support
- Better error handling and UI feedback
