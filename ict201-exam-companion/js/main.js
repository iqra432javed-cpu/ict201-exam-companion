/* ============================================================
   INCT-201 Exam Companion — main.js
   Shared across all pages: theme, progress tracking, Q&A toggle,
   search/filter, expand-all controls.
   ============================================================ */

const ICT201 = (() => {

  const THEME_KEY = "ict201_theme";
  const PROGRESS_KEY = "ict201_progress";

  /* ---------------- Theme ---------------- */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.setAttribute("data-theme", saved);
    const btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.textContent = saved === "dark" ? "☀" : "☾";
      btn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", cur);
        localStorage.setItem(THEME_KEY, cur);
        btn.textContent = cur === "dark" ? "☀" : "☾";
      });
    }
  }

  /* ---------------- Progress store ----------------
     shape: { ch1: { notes:0|1, short:0..1, long:0..1, mcq:0..1 }, ch2:{...}, ch3:{...} }
  */
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch (e) { return {}; }
  }
  function saveProgress(p) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  }
  function markNotesVisited(chapterKey) {
    const p = getProgress();
    p[chapterKey] = p[chapterKey] || {};
    p[chapterKey].notes = 1;
    saveProgress(p);
  }
  function markFraction(chapterKey, field, fraction) {
    const p = getProgress();
    p[chapterKey] = p[chapterKey] || {};
    p[chapterKey][field] = Math.max(p[chapterKey][field] || 0, fraction);
    saveProgress(p);
  }

  /* ---------------- Q&A open/close (short & long question pages) ---------------- */
  function initQACards(chapterKey, field) {
    const cards = document.querySelectorAll(".q-card");
    if (!cards.length) return;

    const openedKey = `ict201_opened_${chapterKey}_${field}`;
    let opened = new Set(JSON.parse(localStorage.getItem(openedKey) || "[]"));

    function updateProgress() {
      markFraction(chapterKey, field, opened.size / cards.length);
    }
    updateProgress();

    cards.forEach((card) => {
      const head = card.querySelector(".q-head");
      const ans = card.querySelector(".q-answer");
      const toggleLabel = card.querySelector(".q-toggle");
      const id = card.dataset.id;
      head.addEventListener("click", () => {
        const isOpen = ans.classList.toggle("open");
        if (toggleLabel) toggleLabel.textContent = isOpen ? "▲ hide" : "▼ show answer";
        if (isOpen) {
          opened.add(id);
          localStorage.setItem(openedKey, JSON.stringify([...opened]));
          updateProgress();
        }
      });
    });

    const expandAll = document.getElementById("expandAll");
    const collapseAll = document.getElementById("collapseAll");
    if (expandAll) expandAll.addEventListener("click", () => {
      document.querySelectorAll(".q-answer").forEach(a => a.classList.add("open"));
      document.querySelectorAll(".q-toggle").forEach(t => t.textContent = "▲ hide");
      cards.forEach(c => opened.add(c.dataset.id));
      localStorage.setItem(openedKey, JSON.stringify([...opened]));
      updateProgress();
    });
    if (collapseAll) collapseAll.addEventListener("click", () => {
      document.querySelectorAll(".q-answer").forEach(a => a.classList.remove("open"));
      document.querySelectorAll(".q-toggle").forEach(t => t.textContent = "▼ show answer");
    });
  }

  /* ---------------- Search filter (works on .q-card or .mcq-card) ---------------- */
  function initSearch(inputId, cardSelector) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener("input", () => {
      const term = input.value.trim().toLowerCase();
      document.querySelectorAll(cardSelector).forEach(card => {
        const text = card.textContent.toLowerCase();
        card.classList.toggle("hidden", term.length > 0 && !text.includes(term));
      });
    });
  }

  /* ---------------- Index page: paint progress bars + stats ---------------- */
  function paintHomeProgress() {
    const p = getProgress();
    document.querySelectorAll("[data-chapter-progress]").forEach(el => {
      const ch = el.getAttribute("data-chapter-progress");
      const d = p[ch] || {};
      const vals = [d.notes || 0, d.short || 0, d.long || 0, d.mcq || 0];
      const avg = vals.reduce((a, b) => a + b, 0) / 4;
      const bar = el.querySelector(".progress span");
      if (bar) bar.style.width = Math.round(avg * 100) + "%";
    });
  }

  return { initTheme, markNotesVisited, markFraction, initQACards, initSearch, paintHomeProgress, getProgress };
})();

document.addEventListener("DOMContentLoaded", () => {
  ICT201.initTheme();
});
