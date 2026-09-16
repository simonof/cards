(function () {
  "use strict";

  let allCards = [];
  let cards = [];      // active, filtered + shuffled
  let idx = 0;

  const flipper = document.getElementById("flipper");
  const qEl = document.getElementById("q");
  const aEl = document.getElementById("a");
  const answerBody = document.getElementById("answer-body");
  const answerImg = document.getElementById("answer-img");
  const counter = document.getElementById("counter");
  const barfill = document.getElementById("barfill");
  const status = document.getElementById("status");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const shuffleBtn = document.getElementById("shuffle");
  const topicSelect = document.getElementById("topic");
  const catFront = document.getElementById("cat-front");
  const catBack = document.getElementById("cat-back");

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setFlipped(on) {
    flipper.classList.toggle("flipped", on);
  }

  function render() {
    const card = cards[idx];
    qEl.textContent = card.question;
    catFront.textContent = card.category || "";
    catBack.textContent = card.category || "";
    answerBody.textContent = card.answer;
    aEl.scrollTop = 0;
    if (card.image) {
      answerImg.innerHTML = "";
      const img = document.createElement("img");
      img.src = card.image;
      img.alt = card.image_caption || "";
      img.loading = "lazy";
      answerImg.appendChild(img);
      if (card.image_caption) {
        const cap = document.createElement("span");
        cap.className = "caption";
        cap.textContent = card.image_caption;
        answerImg.appendChild(cap);
      }
      answerImg.hidden = false;
    } else {
      answerImg.hidden = true;
      answerImg.innerHTML = "";
    }
    setFlipped(false);
    counter.textContent = (idx + 1) + " / " + cards.length;
    barfill.style.width = (((idx + 1) / cards.length) * 100) + "%";
  }

  function go(delta) {
    idx = (idx + delta + cards.length) % cards.length;
    render();
  }

  function toggleFlip() {
    const on = flipper.classList.contains("flipped");
    setFlipped(!on);
  }

  // Tap flips, horizontal swipe navigates to next/prev.
  let justSwiped = false;
  let startX = 0;
  let startY = 0;
  let tracking = false;

  flipper.addEventListener("touchstart", function (e) {
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    justSwiped = false;
  }, { passive: true });

  flipper.addEventListener("touchend", function (e) {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      justSwiped = true;
      go(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  flipper.addEventListener("click", function () {
    if (justSwiped) { justSwiped = false; return; }
    toggleFlip();
  });

  flipper.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleFlip();
    }
  });

  nextBtn.addEventListener("click", function () { go(1); });
  prevBtn.addEventListener("click", function () { go(-1); });

  shuffleBtn.addEventListener("click", function () {
    shuffle(cards);
    idx = 0;
    render();
    status.textContent = "Порядок перемешан";
  });

  function buildTopicOptions() {
    const cats = Array.from(new Set(allCards.map(function (c) { return c.category; })))
      .filter(Boolean)
      .sort(function (a, b) { return a.localeCompare(b, "ru"); });
    topicSelect.innerHTML = "";
    const all = document.createElement("option");
    all.value = "__all__";
    all.textContent = "Все темы";
    topicSelect.appendChild(all);
    cats.forEach(function (c) {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      topicSelect.appendChild(o);
    });
  }

  function applyTopic() {
    const t = topicSelect.value;
    if (t === "__all__" || !t) {
      cards = allCards.slice();
    } else {
      cards = allCards.filter(function (c) { return c.category === t; });
    }
    shuffle(cards);
    idx = 0;
    render();
  }

  topicSelect.addEventListener("change", function () {
    applyTopic();
    const t = topicSelect.value;
    status.textContent = t === "__all__" ? "Все темы" : "Тема: " + t;
  });

  fetch("data/cards.json")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      allCards = data;
      if (!allCards.length) throw new Error("empty");
      shuffle(allCards);
      buildTopicOptions();
      applyTopic();
    })
    .catch(function (err) {
      status.textContent = "Не удалось загрузить карточки: " + err.message;
    });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
