# Read the Room — browser extension

Select text on **any** page (Gmail, Discord, Outlook, a forum, a DM) and decode it
inline — without leaving the page.

## Load it (Chrome / Edge / Brave)

1. Make sure the app is running (`npm run dev` in the project root) — the extension
   talks to it. For a deployed build, set `API_BASE` at the top of `content.js` to your
   live URL first.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked** and select this `extension/` folder.
5. Open any page, select a confusing message, and click the **✦ Read the room** chip.

## How it works

- A content script watches for text selection on every page (`window.getSelection`),
  so it doesn't depend on any specific site's markup.
- The popover renders inside a **shadow root**, so the host page's CSS can't break it
  and it can't break the host page.
- It calls the same `/api/decode` endpoint as the web app (CORS-enabled), so the read
  quality is identical.
- Nothing is stored. The selected text is sent once and discarded, same as the app.

## Notes

- Default `API_BASE` is `http://localhost:3000`. Change it to your deployed URL to use
  the extension away from your machine.
- No icons are bundled (Chrome shows a default) — drop 16/48/128px PNGs in and add an
  `icons` block to `manifest.json` if you want branding.
