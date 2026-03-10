# Debugging Guide - Phase 1

## Your Document Link Analysis

Your link: `https://docs.google.com/document/d/1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os/edit?usp=sharing`

**Extracted Doc ID:** `1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os`

The regex now handles `/edit` suffix correctly ✅

## Step-by-Step Debugging Process

### Step 1: Test Link Detection

Open browser console on ChatGPT and paste this:

```javascript
const text = "Summarize this https://docs.google.com/document/d/1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os/edit?usp=sharing";
const pattern = /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)(?:\/[a-z]+)?/g;
const matches = [...text.matchAll(pattern)];
console.log("Doc ID:", matches[0]?.[1]);
```

Expected output: `Doc ID: 1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os`

### Step 2: Test Direct Fetch

In the same console, try fetching directly:

```javascript
fetch('https://docs.google.com/document/d/1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os/export?format=txt', {
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status, r.statusText);
 return r.text();
})
.then(text => {
  console.log('Content length:', text.length);
  console.log('First 500 chars:', text.substring(0, 500));
})
.catch(e => console.error('Error:', e));
```

**Possible outcomes:**

✅ **Success (Status 200):** Document is public, fetch works → Extension should work
❌ **Status 401/403:** Document is private → Change sharing settings
❌ **Status 404:** Invalid document ID or doesn't exist
⚠️ **CORS Error:** Browser blocking request → May need background script

### Step 3: Check Extension Logs

After submitting a prompt with Enter key, watch for these logs:

```
[ChatDocs] Content script loaded on chat.openai.com
[ChatDocs] Initializing content script...
[ChatDocs] ChatGPT textarea found, attaching listeners
[ChatDocs] Enter key detected, prompt length: X
[ChatDocs] Detected Google Docs link with ID: 1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os
[ChatDocs] Fetching Google Doc: 1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os
[ChatDocs] Fetch URL: https://docs.google.com/document/d/1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os/export?format=txt
[ChatDocs] Response status: XXX
```

### Step 4: Verify Document Sharing

1. Open your Google Doc
2. Click "Share" button (top-right)
3. Click "Change to anyone with the link"
4. Ensure it shows: **"Anyone with the link"** with **"Viewer"** role
5. Copy the link again (remove `/edit?usp=sharing` suffix if present)

Clean link format: `https://docs.google.com/document/d/1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os`

## Common Issues & Solutions

### Issue 1: "HTTP error! status: 401"

**Cause:** Document is private

**Solution:**
```
Google Doc → Share → Anyone with the link → Viewer
```

### Issue 2: "HTTP error! status: 403"

**Cause:** Insufficient permissions or domain restriction

**Solution:**
- Check if document is restricted to specific Google Workspace domain
- Make sure it's not limited to specific email addresses

### Issue 3: No logs appearing

**Cause:**Extension not loaded or content script not injected

**Solution:**
1. Go to `chrome://extensions/`
2. Verify ChatDocs extension is enabled
3. Reload the extension
4. Refresh ChatGPT page
5. Check console for "[ChatDocs] Content script loaded"

### Issue 4: "Detected Google Docs link" but no fetch attempt

**Cause:** Link detection working but fetch blocked

**Solution:**
- Check browser console for CORS errors
- May need to move fetch logic to background script
- Try disabling other extensions temporarily

### Issue 5: Prompt not being replaced

**Cause:** Textarea replacement failing

**Solution:**
- Check for errors in console after "Enter key detected"
- Verify ChatGPT UI hasn't changed (aria-label might be different)
- Try manually clicking Send after the modification

## Quick Test Checklist

Run through these tests in order:

```
□ Extension loaded (check chrome://extensions/)
□ Content script initialized (look for log in console)
□ Link detected (paste link in textarea, watch console)
□ Fetch initiated (press Enter, watch for fetch log)
□ Response received (check status code in logs)
□ Prompt replaced (textarea should update with content)
□ Message sent (watch for button click log)
□ ChatGPT responds based on document content
```

## Expected Console Output (Full Success)

```
[ChatDocs] Content script loaded on chat.openai.com
[ChatDocs] Initializing content script...
[ChatDocs] ChatGPT textarea found, attaching listeners
[ChatDocs] Content script initialized successfully
[You type and press Enter]
[ChatDocs] Enter key detected, prompt length: 95
[ChatDocs] Detected Google Docs link with ID: 1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os
[ChatDocs] Processing prompt with Google Docs link...
[ChatDocs] Fetching Google Doc: 1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os
[ChatDocs] Fetch URL: https://docs.google.com/document/d/1pLNHlUcOA5OJLb3-fSpuFGX_Osrcme3Xriw_ccB-9Os/export?format=txt
[ChatDocs] Response status: 200 OK
[ChatDocs] Raw response length: 1523 chars
[ChatDocs] Successfully fetched Google Doc (1523 chars)
[ChatDocs] Prompt rewritten with document content (1687 chars)
[ChatDocs] Modified prompt preview: Summarize this

--- BEGIN GOOGLE DOC CONTENT ---

[First 200 chars of content]...
[ChatDocs] Successfully replaced prompt text
[ChatDocs] Message sent via button click
```

## Manual Document Access Test

Before testing the extension, verify the document itself is accessible:

1. Open an **Incognito Window**
2. Paste your Google Doc link
3. If it asks you to sign in → **Document is PRIVATE** ❌
4. If it shows the document → **Document is PUBLIC** ✅

This is the ultimate test for whether the extension should work.

## Alternative Test with Known Public Document

If your document keeps failing, test with a known public document:

Example public doc (create your own):
1. Create new Google Doc
2. Add text: "This is a test document for ChatDocs extension testing."
3. Share → Anyone with the link can view
4. Copy link and test

## Still Not Working?

If you've tried everything and it still fails, provide these details:

1. **Console logs** - Full output from pressing Enter
2. **Network tab** - Check the export request in Network tab
3. **Sharing settings screenshot** - Verify document permissions
4. **Test result from Step 2** - Direct fetch in console

This will help identify if it's:
- Network/CORS issue
- Authentication issue  
- Document permission issue
- Extension logic issue
