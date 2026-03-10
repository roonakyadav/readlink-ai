# ChatDocs

ChatDocs is a Chrome extension that allows ChatGPT to read Google Docs directly from pasted links.

## Features

- Detects Google Docs links in ChatGPT prompts
- Fetches document content automatically
- Injects the text into the prompt
- Sends the message to ChatGPT

## Example

User prompt:

Summarize this:
https://docs.google.com/document/d/...

Extension automatically converts it to:

--- BEGIN GOOGLE DOC CONTENT ---
(document text)
--- END GOOGLE DOC CONTENT ---

## Tech Stack

- Chrome Extension (Manifest v3)
- JavaScript
- DOM interception
- Background service worker

## Project Structure

extension/
background.js
contentScript.js
promptInterceptor.js
fetchers/
utils/

## Author

Ronak Yadav  
Scaler School of Technology
