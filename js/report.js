// "Report an error": a short form that posts to a form service (Formspree), which emails the author.
// The author's address never appears in the game: only the form's endpoint does.
// Set FORM_ENDPOINT to the form's address (https://formspree.io/f/<form id>). Until then the form says
// reporting isn't set up yet and sends nothing.
window.Report = (function () {
  const FORM_ENDPOINT = "https://formspree.io/f/xljbwrjj";

  const $ = (s) => document.querySelector(s);
  let context = {};

  function open(ctx) {
    context = ctx || {};
    $("#report-about").textContent = context.label || "About the game in general";
    $("#report-msg").textContent = FORM_ENDPOINT ? "" : "Reporting isn’t set up yet — this form can’t send anything.";
    $("#report-msg").className = "report-msg" + (FORM_ENDPOINT ? "" : " err");
    $("#report-send").disabled = !FORM_ENDPOINT;
    $("#report").classList.remove("hidden");
    setTimeout(() => $("#report-text").focus(), 50);
  }
  function close() { $("#report").classList.add("hidden"); }

  async function send(e) {
    e.preventDefault();
    const text = $("#report-text").value.trim();
    if (!text) { $("#report-text").focus(); return; }
    if ($("#report-trap").value) { close(); return; } // filled in by a bot: drop it quietly
    const btn = $("#report-send"), msg = $("#report-msg");
    btn.disabled = true; msg.className = "report-msg"; msg.textContent = "Sending…";
    const body = {
      _subject: "Posta hut error report" + (context.guardName ? ": " + context.guardName : ""),
      message: text,
      from: $("#report-from").value.trim(),
      about: context.label || "general",
      guard: context.guard || "", master: context.master || "", plate: context.plate || "",
      where: (window.IS_APP ? "Android app" : "website") + " · " + location.pathname.split("/").pop() + " · " + navigator.userAgent,
    };
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      msg.textContent = "Thank you — your report has been sent.";
      $("#report-text").value = "";
      setTimeout(close, 1400);
    } catch (err) {
      msg.className = "report-msg err";
      msg.textContent = "Couldn’t send — check your connection and try again. Your text is kept.";
    } finally {
      btn.disabled = !FORM_ENDPOINT;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#report-form").addEventListener("submit", send);
    $("#report-cancel").addEventListener("click", close);
    $("#report").addEventListener("click", (e) => { if (e.target.id === "report") close(); }); // tap outside the card
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#report").classList.contains("hidden")) close(); });
  });

  return { open, close, get ready() { return !!FORM_ENDPOINT; } };
})();
