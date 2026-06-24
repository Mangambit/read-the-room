/**
 * Read the Room — content script.
 * Select text on any page → a "Read the room" chip appears → click it → a
 * popover decodes the selected message inline. Generic window.getSelection, so
 * it works on Gmail, Discord, Outlook, anywhere. Styles live in a shadow root
 * so the host page can't break them (and we can't break the host page).
 *
 * Set API_BASE to your deployed URL after you ship (it defaults to local dev).
 */
(function () {
  const API_BASE = "http://localhost:3000";

  // Read the Room palette (kept in sync with the app's design tokens).
  const C = {
    paper: "#ffffff",
    sunk: "#e3dfd9",
    ink: "#262329",
    inkSoft: "#5f5a63",
    inkFaint: "#8b8690",
    line: "#ded9d3",
    plum: "#3a2a4d",
    plumRaised: "#46355a",
    onPlum: "#f4eff7",
    onPlumSoft: "#c8bcd2",
    rose: "#c9608f",
    roseInk: "#a23a6b",
    heat: "#b8443f",
    calm: "#3f7d66",
    caution: "#bf8526",
  };

  let chip = null;
  let host = null; // shadow host for the popover
  let lastText = "";

  document.addEventListener("mouseup", onMouseUp, true);
  document.addEventListener("mousedown", onMouseDownOutside, true);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
  window.addEventListener("scroll", () => removeChip(), true);

  function onMouseUp(e) {
    if (host && host.contains(e.target)) return; // clicks inside our popover
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : "";
      if (!text || text.length < 2 || text.length > 4000) {
        removeChip();
        return;
      }
      lastText = text;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      showChip(rect);
    }, 10);
  }

  function onMouseDownOutside(e) {
    if (host && !host.contains(e.target) && e.target !== chip) closePopover();
  }

  function showChip(rect) {
    removeChip();
    chip = document.createElement("div");
    chip.textContent = "✦ Read the room";
    Object.assign(chip.style, {
      position: "fixed",
      left: Math.max(8, rect.left) + "px",
      top: rect.bottom + 8 + "px",
      zIndex: 2147483647,
      background: C.ink,
      color: C.paper,
      font: "600 13px/1 ui-sans-serif, system-ui, sans-serif",
      padding: "8px 12px",
      borderRadius: "999px",
      boxShadow: "0 6px 20px rgba(38,35,41,.25)",
      cursor: "pointer",
      userSelect: "none",
    });
    chip.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      openPopover(rect);
    });
    document.body.appendChild(chip);
  }

  function removeChip() {
    if (chip) {
      chip.remove();
      chip = null;
    }
  }

  function closePopover() {
    if (host) {
      host.remove();
      host = null;
    }
  }
  function closeAll() {
    removeChip();
    closePopover();
  }

  function openPopover(rect) {
    removeChip();
    closePopover();

    host = document.createElement("div");
    Object.assign(host.style, {
      position: "fixed",
      left: clamp(rect.left, 8, window.innerWidth - 360) + "px",
      top: Math.min(rect.bottom + 8, window.innerHeight - 40) + "px",
      zIndex: 2147483647,
    });
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = shell();
    document.body.appendChild(host);

    decode(lastText)
      .then((data) => {
        if (!host) return;
        if (data && data.result) render(root, lastText, data.result);
        else renderError(root, (data && data.error) || "Couldn't read that one.");
      })
      .catch(() => host && renderError(root, "Couldn't reach Read the Room."));
  }

  function shell() {
    return `
      <style>
        .card{width:340px;max-width:88vw;background:${C.paper};color:${C.ink};
          border:1px solid ${C.line};border-radius:18px;overflow:hidden;
          box-shadow:0 18px 48px rgba(38,35,41,.22);
          font:14px/1.5 ui-sans-serif,system-ui,sans-serif;}
        .top{display:flex;align-items:center;justify-content:space-between;
          padding:10px 14px;border-bottom:1px solid ${C.line};}
        .brand{font-weight:700;font-size:13px;}
        .dot{display:inline-block;width:8px;height:8px;border-radius:50%;
          background:${C.rose};margin-right:6px;vertical-align:middle;}
        .x{cursor:pointer;color:${C.inkFaint};border:0;background:none;font-size:16px;line-height:1;}
        .body{padding:14px;}
        .eyebrow{font-size:10px;font-weight:700;letter-spacing:.16em;
          text-transform:uppercase;color:${C.inkFaint};margin:0 0 6px;}
        .reveal{background:${C.plum};color:${C.onPlum};border-radius:14px;padding:14px;}
        .reveal .eyebrow{color:${C.onPlumSoft};}
        .meaning{margin:0;font-size:16px;font-weight:600;line-height:1.35;}
        .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
        .chip{font-size:12px;border:1px solid ${C.onPlumSoft}55;color:${C.onPlumSoft};
          background:${C.plumRaised};border-radius:999px;padding:2px 10px;}
        .row{display:flex;gap:14px;margin-top:12px;}
        .row .lab{font-size:10px;font-weight:700;letter-spacing:.12em;
          text-transform:uppercase;color:${C.inkFaint};}
        .yes{color:${C.heat};font-weight:700;} .prob{color:${C.caution};font-weight:700;}
        .no{color:${C.calm};font-weight:700;}
        .want{margin-top:12px;border-left:3px solid ${C.rose};
          background:${C.rose}1a;border-radius:10px;padding:8px 10px;}
        .muted{color:${C.inkSoft};font-size:13px;margin:4px 0 0;}
        .loading{padding:24px 14px;color:${C.inkFaint};text-align:center;}
        a.more{display:inline-block;margin-top:12px;font-size:12px;color:${C.roseInk};font-weight:700;text-decoration:none;}
      </style>
      <div class="card">
        <div class="top">
          <span class="brand"><span class="dot"></span>Read the Room</span>
          <button class="x" id="rtr-x" aria-label="Close">×</button>
        </div>
        <div class="body" id="rtr-body">
          <div class="loading">Reading between the lines…</div>
        </div>
      </div>`;
  }

  function render(root, message, r) {
    const upsetCls = r.upset === "yes" ? "yes" : r.upset === "probably" ? "prob" : "no";
    const upsetLab = r.upset === "yes" ? "Yes" : r.upset === "probably" ? "Probably" : "No";
    const chips = (r.tones || [])
      .map((t) => `<span class="chip">${esc(t)}</span>`)
      .join("");
    root.getElementById("rtr-body").innerHTML = `
      <div class="reveal">
        <p class="eyebrow">What they really mean</p>
        <p class="meaning">${esc(r.meaning)}</p>
        <div class="chips">${chips}</div>
      </div>
      <div class="row">
        <div><div class="lab">Upset with you?</div><div class="${upsetCls}">${upsetLab}</div></div>
        <div><div class="lab">Urgency</div><div style="text-transform:capitalize">${esc(r.urgency)}</div></div>
        <div><div class="lab">Sure</div><div>${r.confidence}%</div></div>
      </div>
      <div class="want">
        <div class="lab">What they want</div>
        <p class="muted">${esc(r.wants)}</p>
      </div>
      <a class="more" href="${API_BASE}" target="_blank" rel="noopener">Open in Read the Room →</a>`;
    bindClose(root);
  }

  function renderError(root, msg) {
    root.getElementById("rtr-body").innerHTML = `<p class="muted">${esc(msg)}</p>`;
    bindClose(root);
  }

  function bindClose(root) {
    const x = root.getElementById("rtr-x");
    if (x) x.addEventListener("click", closePopover);
  }

  async function decode(message) {
    const res = await fetch(API_BASE + "/api/decode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return res.json();
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  }
})();
