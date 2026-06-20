/* ============================================================
   INCT-201 Exam Companion — quiz-engine.js
   Generic MCQ renderer: takes a data array + container id,
   draws cards, locks answers on click, tracks score, and
   reports progress back to ICT201.markFraction().
   Expected item shape:
   { q: "question text", options: ["...","...","...","..."],
     correct: 0, explain: "why", topic: "short topic tag" }
   ============================================================ */

function renderMCQs(containerId, data, chapterKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const letters = ["A", "B", "C", "D"];
  let attempted = 0, correct = 0;

  const scoreBar = document.getElementById("scoreBar");
  function paintScore() {
    if (!scoreBar) return;
    scoreBar.querySelector(".attempted").textContent = attempted;
    scoreBar.querySelector(".total").textContent = data.length;
    scoreBar.querySelector(".correct").textContent = correct;
    const pct = attempted ? Math.round((correct / attempted) * 100) : 0;
    scoreBar.querySelector(".pct").textContent = pct + "%";
  }

  data.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "mcq-card";
    card.dataset.idx = idx;

    const qEl = document.createElement("div");
    qEl.className = "mcq-q";
    qEl.innerHTML = `<span class="q-num">Q${idx + 1}.</span>${item.q}`;
    card.appendChild(qEl);

    const optsWrap = document.createElement("div");
    optsWrap.className = "mcq-opts";

    item.options.forEach((opt, oIdx) => {
      const optEl = document.createElement("div");
      optEl.className = "mcq-opt";
      optEl.innerHTML = `<span class="letter">${letters[oIdx]}</span><span>${opt}</span>`;
      optEl.addEventListener("click", () => {
        if (card.dataset.answered) return;
        card.dataset.answered = "1";
        attempted++;
        const isCorrect = oIdx === item.correct;
        if (isCorrect) correct++;
        optsWrap.querySelectorAll(".mcq-opt").forEach((el, i) => {
          el.classList.add("disabled");
          if (i === item.correct) el.classList.add("correct");
          if (i === oIdx && !isCorrect) el.classList.add("wrong");
        });
        const exp = card.querySelector(".mcq-exp");
        if (exp) exp.classList.add("show");
        paintScore();
        ICT201.markFraction(chapterKey, "mcq", attempted / data.length);
      });
      optsWrap.appendChild(optEl);
    });
    card.appendChild(optsWrap);

    if (item.explain) {
      const exp = document.createElement("div");
      exp.className = "mcq-exp";
      exp.innerHTML = `<strong>Why</strong><br>${item.explain}`;
      card.appendChild(exp);
    }

    if (item.topic) {
      const tagRow = document.createElement("div");
      tagRow.className = "tag-row";
      tagRow.innerHTML = `<span class="pill">${item.topic}</span>`;
      card.appendChild(tagRow);
    }

    container.appendChild(card);
  });

  paintScore();
  ICT201.markFraction(chapterKey, "mcq", 0);

  const resetBtn = document.getElementById("resetQuiz");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => location.reload());
  }
}
