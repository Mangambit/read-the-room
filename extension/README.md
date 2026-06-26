# Read the Room — browser extension

Select text on **any** page (Gmail, Discord, Outlook, a forum, a DM) and decode it
inline — without leaving the page.

## Load it (Chrome / Edge / Brave)

Works out of the box — it talks to the live deployment, so you don't need to run
anything locally.

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this `extension/` folder
   (or unzip `read-the-room-extension.zip` and select that folder).
4. Open any page, select a confusing message, and click the **✦ Read the room** chip.

## How it works

- A content script watches for text selection on every page (`window.getSelection`),
  so it doesn't depend on any specific site's markup.
- The popover renders inside a **shadow root**, so the host page's CSS can't break it
  and it can't break the host page.
- It calls the same `/api/decode` endpoint as the web app (CORS-enabled), so the read
  quality is identical.
- Nothing is stored. The selected text is sent once and discarded, same as the app.

## Notes

- `API_BASE` (top of `content.js`) defaults to the live site
  `https://read-the-room-phi.vercel.app`. Set it to `http://localhost:3000` for local dev.
- No icons are bundled (Chrome shows a default) — drop 16/48/128px PNGs in and add an
  `icons` block to `manifest.json` if you want branding.
