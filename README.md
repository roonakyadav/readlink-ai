# ReadLink AI

**Let AI read your links.**

ReadLink AI is a Chrome extension that automatically loads the content of a Google Docs link into ChatGPT so the AI can actually read and understand the document.

Normally, when you paste a Google Docs link into ChatGPT, the AI cannot access it. ReadLink AI fixes this by fetching the document content and inserting it into the prompt automatically.

---

## Features

• Automatically detects Google Docs links in ChatGPT prompts
• Fetches document content securely using a background worker
• Injects the content directly into the prompt for the AI
• Works instantly when you press **Enter**
• Handles large documents safely with text trimming
• Works with ChatGPT's dynamic interface

---

## Example

### Without ReadLink AI

You paste:

```
Summarize this document:
https://docs.google.com/document/d/xxxxx
```

ChatGPT replies:

```
I cannot access that document.
```

---

### With ReadLink AI

Your prompt automatically becomes:

```
Summarize this document.

----- GOOGLE DOC CONTENT -----
(actual document text here)
```

Now the AI can read and analyze the document.

---

## How It Works

1. Detects a Google Docs link inside the prompt
2. Extracts the document ID
3. Background worker fetches the document text
4. Injects the content into the ChatGPT prompt
5. Sends the updated prompt

---

## Installation (Developer Mode)

1. Clone the repository

```
git clone https://github.com/roonakyadav/readlink-ai.git
```

2. Open Chrome

```
chrome://extensions
```

3. Enable **Developer Mode**

4. Click **Load Unpacked**

5. Select the `extension` folder

---

## Tech Stack

* Chrome Extension Manifest V3
* JavaScript
* Service Workers
* DOM interception
* Google Docs export API

---

## Roadmap

Future improvements:

• Support for more link types (Notion, Medium, PDFs)
• Automatic summarization mode
• Smart chunking for extremely large documents
• Support for multiple AI platforms

---

## Author

Ronak Yadav
Scaler School of Technology

---

## License

MIT License
