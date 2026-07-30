/**
 * RingMang PWA controller — Phase 11
 * - Registers /sw.js
 * - Install prompt (Android/Chrome via beforeinstallprompt; iOS manual instructions)
 * - Online/Offline indicator (body.is-offline + topbar pill)
 * - Update-available toast
 * No changes to script.js required.
 */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var banner = $("install-banner"), sub = $("install-sub"), acceptBtn = $("install-accept"), dismissBtn = $("install-dismiss");
  var pill = $("offline-pill");
  var DISMISS_KEY = "rm_install_dismissed_v1";
  var deferredPrompt = null;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "") && !window.MSStream;
  var isStandalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;

  function toast(m) {
    var t = $("toast"), p = $("toast-message"); if (!t || !p) return;
    p.textContent = m; t.classList.remove("hidden");
    clearTimeout(window.__rm_toast); window.__rm_toast = setTimeout(function () { t.classList.add("hidden"); }, 3200);
  }
  function dismissedRecently() {
    try { var v = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10); return v && (Date.now() - v < 3 * 24 * 3600 * 1000); } catch (e) { return false; }
  }
  function markDismissed() { try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {} }

  function showBanner(mode) {
    if (!banner || isStandalone) return;
    if (mode === "ios") {
      if (sub) sub.innerHTML = "RingMang लाई home screen मा राख्न: तलको <b>Share (↗)</b> बटन थिच्नुहोस्, त्यसपछि <b>“Add to Home Screen”</b> छान्नुहोस्।";
      if (acceptBtn) acceptBtn.innerHTML = "बुझेँ (Got it)";
      if (dismissBtn) dismissBtn.style.display = "none";
    } else {
      if (sub) sub.textContent = "Add it to your home screen — opens full-screen, lighter on data, and remembers your last session.";
      if (acceptBtn) acceptBtn.innerHTML = '<span class="install-pulse" aria-hidden="true"></span>Install';
      if (dismissBtn) dismissBtn.style.display = "";
    }
    banner.classList.remove("hidden");
  }
  function hideBanner() { if (banner) banner.classList.add("hidden"); }

  // ===== Install prompt (Android / Chrome / Edge) =====
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferredPrompt = e;
    if (!dismissedRecently() && !isStandalone) setTimeout(function () { showBanner("install"); }, 2500);
  });
  window.addEventListener("appinstalled", function () { hideBanner(); deferredPrompt = null; toast("✓ RingMang install भयो!"); });

  if (acceptBtn) acceptBtn.addEventListener("click", async function () {
    if (isIOS || !deferredPrompt) { hideBanner(); markDismissed(); return; }
    try {
      deferredPrompt.prompt();
      var choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") toast("Installing…");
      deferredPrompt = null; hideBanner();
    } catch (e) { hideBanner(); }
  });
  if (dismissBtn) dismissBtn.addEventListener("click", function () { hideBanner(); markDismissed(); });

  // ===== iOS proactive hint (no beforeinstallprompt on iOS) =====
  if (isIOS && !isStandalone && !dismissedRecently()) {
    setTimeout(function () { showBanner("ios"); }, 4000);
  }

  // ===== Online / Offline indicator =====
  var wasOffline = !navigator.onLine;
  function syncOnline() {
    var offline = !navigator.onLine;
    document.body.classList.toggle("is-offline", offline);
    if (pill) pill.classList.toggle("hidden", !offline);
    if (offline && !wasOffline) toast("📡 Offline — cached library मात्र; play/download लाई connection चाहिन्छ।");
    if (!offline && wasOffline) toast("🟢 Back online — सबै feature तयार।");
    wasOffline = offline;
  }
  window.addEventListener("online", syncOnline);
  window.addEventListener("offline", syncOnline);

  // ===== Register Service Worker + update toast =====
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").then(function (reg) {
        syncOnline();
        reg.addEventListener("updatefound", function () {
          var w = reg.installing; if (!w) return;
          w.addEventListener("statechange", function () {
            if (w.state === "installed" && navigator.serviceWorker.controller) {
              toast("🔄 नयाँ version तयार छ — page refresh गर्नुहोस्।");
            }
          });
        });
      }).catch(function (e) { console.warn("SW register failed:", e); syncOnline(); });
    });
  } else {
    syncOnline();
  }
})();
