# PDR.md
# Project: ContextBridge — Universal Link Reader for ChatGPT

## 1. Overview

ContextBridge is a browser extension that allows ChatGPT to read the content of links pasted into the chat interface, including private or authenticated pages that the user already has access to in their browser session.

The extension detects supported links in prompts, retrieves their content using the user's authenticated browser session, extracts meaningful text, and injects that text into the prompt before it is sent to ChatGPT.

From the user perspective, the workflow remains natural:

Example:

User message:
"Hey GPT, can you summarize this https://docs.google.com/document/d/... ?"

The extension automatically retrieves the document text and sends:

"Hey GPT, summarize this document:

<document content>"

ChatGPT then produces the answer normally.

No manual copy-paste is required.

---

# 2. Problem Statement

ChatGPT cannot access:

- Private Google Docs
- Notion pages
- Google Drive documents
- Authenticated webpages
- YouTube transcripts automatically
- PDFs behind login

Users must manually:

1. Open the link
2. Copy the text
3. Paste into ChatGPT

This creates friction and slows down workflows.

---

# 3. Goals

Primary Goals

1. Allow ChatGPT to read links pasted into prompts
2. Support private authenticated pages
3. Maintain normal ChatGPT workflow
4. Require no backend servers
5. Operate entirely in the browser
6. Preserve user privacy (no external servers)

Secondary Goals

1. Support multiple platforms
2. Handle large documents safely
3. Automatically summarize or chunk long documents
4. Provide clear failure handling

---

# 4. Non Goals

This extension will NOT:

- Modify ChatGPT responses
- Send user data to external servers
- Bypass authentication systems
- Store user content permanently

---

# 5. Supported Sources (Phase 1)

## 5.1 Google Docs

Example:
https://docs.google.com/document/d/<DOC_ID>

Method:
Export endpoint

https://docs.google.com/document/d/<DOC_ID>/export?format=txt

Uses browser cookies for authentication.

---

## 5.2 Notion Pages

Example:
https://www.notion.so/...

Method:

- Fetch HTML page
- Parse DOM
- Extract readable content

---

## 5.3 Google Drive Files

Supported:

- Google Docs
- Google Sheets (text export)
- Google Slides (text extraction)

Method:

Drive export endpoints.

---

## 5.4 PDFs

Example:
https://example.com/file.pdf

Method:

1. Fetch PDF
2. Parse text using pdf.js

---

## 5.5 YouTube

Example:
https://youtube.com/watch?v=...

Method:

Fetch transcript via:

youtube timedtext API

Fallback:

yt-dlp transcript extraction.

---

# 6. System Architecture

High level architecture


User Prompt
↓
ChatGPT Page
↓
Browser Extension
↓
Link Detection Engine
↓
Content Fetcher
↓
Content Extractor
↓
Prompt Injector
↓
ChatGPT API Request


---

# 7. Core Components

## 7.1 Link Detection Engine

Detect supported links inside the prompt.

Regex patterns:

Google Docs

/https://docs.google.com/document/d/([a-zA-Z0-9_-]+)/


Notion

/https://www.notion.so/.*/


YouTube

/https://(www.)?youtube.com/watch?v=/


PDF

/.pdf$/


---

## 7.2 Prompt Interceptor

Intercept user message before it is sent.

Approach:

Use MutationObserver to detect prompt submission.

Targets:

- Send button click
- Enter key press

Flow:

1. Capture prompt
2. Detect links
3. Process links
4. Rewrite prompt
5. Send modified prompt

---

## 7.3 Content Fetcher

Responsible for retrieving content.

Capabilities:

- Fetch authenticated pages
- Follow redirects
- Handle export endpoints
- Support CORS

---

## 7.4 Content Extractor

Extract meaningful text.

Different extractor per platform.

Google Docs:
Plain text export.

Notion:
DOM parsing.

PDF:
PDF text extraction.

YouTube:
Transcript parsing.

---

## 7.5 Prompt Rewriter

Transforms:

User prompt:


Summarize this
https://docs.google.com/document/d/123


Into:


Summarize this document.

Document content:

<document text>

---

# 8. Token Safety

Large documents must be truncated.

Strategy:

Max characters:

20000

Alternative:

Chunking.

Example:


Document Part 1
Document Part 2


---

# 9. Privacy Model

The extension:

- Runs entirely locally
- Uses browser authentication
- Does not store content
- Does not transmit data externally

---

# 10. Performance Requirements

Document extraction target:

< 2 seconds

Prompt rewrite latency:

< 1 second

YouTube transcript extraction:

< 3 seconds

---

# 11. Error Handling

Possible failures:

1. User lacks permission to document
2. Document export fails
3. Network timeout
4. Content too large

Fallback behavior:

Return message:

"Unable to retrieve document. Please ensure access permissions are enabled."

---

# 12. Extension Structure


extension/
manifest.json
background.js
contentScript.js
linkDetector.js
fetchers/
googleDocs.js
notion.js
youtube.js
pdf.js
promptInjector.js
utils/
domParser.js
textCleaner.js


---

# 13. Permissions

Manifest permissions:


activeTab
scripting
storage


Host permissions:


https://chat.openai.com/\
*
https://docs.google.com/\
*
https://www.notion.so/\
*
https://www.youtube.com/\
*
<all_urls>


---

# 14. UX Flow

User:

1. Opens ChatGPT
2. Pastes a link
3. Sends prompt

Extension:

1. Detects link
2. Retrieves content
3. Injects text
4. Prompt is sent

ChatGPT:

Generates response.

User experience remains unchanged.

---

# 15. Security Considerations

1. Prevent prompt injection attacks from webpages
2. Sanitize extracted text
3. Remove scripts or malicious HTML
4. Limit content size

---

# 16. Future Features

Phase 2

Support:

- GitHub repos
- Slack threads
- Gmail emails
- Confluence pages

Phase 3

Add:

Automatic summarization pipeline

Example:


Link detected → auto summary → GPT receives summary + context


---

# 17. Success Metrics

Key metrics:

- Extension installs
- Link processing success rate
- Average extraction latency
- Prompt success rate

Target:

95% link extraction success.

---

# 18. Development Milestones

Milestone 1

Core extension framework.

Milestone 2

Google Docs integration.

Milestone 3

Notion support.

Milestone 4

YouTube transcripts.

Milestone 5

PDF parsing.

Milestone 6

Optimization and release.

---

# 19. Risks

Major risks:

1. Website DOM changes
2. Token limits
3. Cross origin restrictions
4. Large documents

Mitigation:

Use export endpoints where possible.

---

# 20. Expected Code Size

Approximate project size:

1500–2500 lines.

---

# End of Document
