(() => {
  const QUESTIONS = window.QUESTIONS || [];
  const CHARACTERS = window.CHARACTERS || {};
  const STORAGE_KEY = "anime-mbti-test-state-v1";
  const ANSWER_VALUES = [-3, -2, -1, 0, 1, 2, 3];
  const ANSWER_LABELS = {
    "-3": "Совсем не про меня",
    "-2": "Скорее не согласен",
    "-1": "Слегка не согласен",
    "0": "Нейтрально",
    "1": "Слегка согласен",
    "2": "Скорее согласен",
    "3": "Это точно про меня"
  };
  const DIMENSIONS = {
    EI: { letters: ["E", "I"], label: "Шкала E / I" },
    NS: { letters: ["N", "S"], label: "Шкала N / S" },
    TF: { letters: ["T", "F"], label: "Шкала T / F" },
    JP: { letters: ["J", "P"], label: "Шкала J / P" }
  };
  const MAX_DIMENSION_SCORE = 18;

  if (!QUESTIONS.length) {
    return;
  }

  const elements = {
    screens: document.querySelectorAll(".screen"),
    startButton: document.getElementById("start-button"),
    backButton: document.getElementById("back-button"),
    nextButton: document.getElementById("next-button"),
    shareButton: document.getElementById("share-button"),
    restartButton: document.getElementById("restart-button"),
    questionCounter: document.getElementById("question-counter"),
    progressFill: document.getElementById("progress-fill"),
    questionTypeBadge: document.getElementById("question-type-badge"),
    questionText: document.getElementById("question-text"),
    answerScale: document.getElementById("answer-scale"),
    answerHint: document.getElementById("answer-hint"),
    resultType: document.getElementById("result-type"),
    mainCharacter: document.getElementById("main-character"),
    otherCharacters: document.getElementById("other-characters"),
    scoreList: document.getElementById("score-list"),
    shareFeedback: document.getElementById("share-feedback")
  };

  const state = loadState();

  initTelegram();
  createAnswerButtons();
  bindEvents();
  restoreView();

  function bindEvents() {
    elements.startButton.addEventListener("click", () => {
      resetState();
      showTestScreen();
    });

    elements.backButton.addEventListener("click", () => {
      if (state.currentQuestion === 0) {
        return;
      }

      state.currentQuestion -= 1;
      saveState();
      renderQuestion();
    });

    elements.nextButton.addEventListener("click", () => {
      if (state.answers[state.currentQuestion] === null) {
        return;
      }

      if (state.currentQuestion === QUESTIONS.length - 1) {
        state.completed = true;
        saveState();
        showResultScreen();
        return;
      }

      state.currentQuestion += 1;
      saveState();
      renderQuestion();
    });

    elements.shareButton.addEventListener("click", handleShare);
    elements.restartButton.addEventListener("click", () => {
      resetState();
      showScreen("start-screen");
    });
  }

  function createAnswerButtons() {
    elements.answerScale.innerHTML = "";

    ANSWER_VALUES.forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      button.dataset.value = String(value);
      button.textContent = value > 0 ? `+${value}` : String(value);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-label", ANSWER_LABELS[String(value)]);
      button.setAttribute("aria-checked", "false");
      button.addEventListener("click", () => selectAnswer(value));
      elements.answerScale.appendChild(button);
    });
  }

  function restoreView() {
    if (state.completed && hasAnswers()) {
      showResultScreen();
      return;
    }

    if (hasAnswers()) {
      showTestScreen();
      return;
    }

    showScreen("start-screen");
  }

  function showTestScreen() {
    showScreen("test-screen");
    renderQuestion();
  }

  function showResultScreen() {
    showScreen("result-screen");
    renderResult();
  }

  function showScreen(screenId) {
    elements.screens.forEach((screen) => {
      screen.classList.toggle("is-visible", screen.id === screenId);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderQuestion() {
    const question = QUESTIONS[state.currentQuestion];
    const answer = state.answers[state.currentQuestion];
    const progress = ((state.currentQuestion + 1) / QUESTIONS.length) * 100;

    elements.questionCounter.textContent = `Вопрос ${state.currentQuestion + 1} из ${QUESTIONS.length}`;
    elements.progressFill.style.width = `${progress}%`;
    elements.questionTypeBadge.textContent = DIMENSIONS[question.type].label;
    elements.questionText.textContent = question.text;
    elements.answerHint.textContent = answer === null
      ? "Выбери один вариант, чтобы продолжить."
      : ANSWER_LABELS[String(answer)];
    elements.backButton.disabled = state.currentQuestion === 0;
    elements.nextButton.disabled = answer === null;
    elements.nextButton.textContent = state.currentQuestion === QUESTIONS.length - 1
      ? "Показать результат"
      : "Далее";

    syncAnswerButtons(answer);
  }

  function syncAnswerButtons(selectedValue) {
    const buttons = elements.answerScale.querySelectorAll(".answer-option");

    buttons.forEach((button) => {
      const isSelected = Number(button.dataset.value) === selectedValue;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-checked", String(isSelected));
    });
  }

  function selectAnswer(value) {
    state.answers[state.currentQuestion] = value;
    saveState();
    renderQuestion();
  }

  function renderResult() {
    const result = calculateResult();
    const characters = CHARACTERS[result.type] || {
      main: "Spike Spiegel",
      others: ["Vash the Stampede", "Mugen", "Kakashi Hatake"]
    };

    elements.resultType.textContent = result.type;
    elements.mainCharacter.textContent = characters.main;
    elements.shareFeedback.textContent = "";

    elements.otherCharacters.innerHTML = "";
    characters.others.forEach((name) => {
      const chip = document.createElement("div");
      chip.className = "character-chip";
      chip.textContent = name;
      elements.otherCharacters.appendChild(chip);
    });

    elements.scoreList.innerHTML = "";
    result.scales.forEach((scale) => {
      const card = document.createElement("article");
      card.className = "score-card";
      card.innerHTML = `
        <div class="score-head">
          <span>${scale.leftLetter} / ${scale.rightLetter}</span>
          <span>${scale.leadingLetter} ${scale.leadingPercent}%</span>
        </div>
        <div class="score-bar">
          <div class="score-bar-fill" style="width: ${scale.leftPercent}%"></div>
        </div>
        <div class="score-footer">
          <span>${scale.leftLetter}: ${scale.leftPercent}%</span>
          <span>${scale.rightLetter}: ${scale.rightPercent}%</span>
        </div>
      `;
      elements.scoreList.appendChild(card);
    });
  }

  function calculateResult() {
    const totals = {
      EI: 0,
      NS: 0,
      TF: 0,
      JP: 0
    };

    QUESTIONS.forEach((question, index) => {
      totals[question.type] += Number(state.answers[index] || 0);
    });

    const scales = Object.entries(DIMENSIONS).map(([key, meta]) => {
      const score = totals[key];
      const leftPercent = clamp(Math.round(((score + MAX_DIMENSION_SCORE) / (MAX_DIMENSION_SCORE * 2)) * 100), 0, 100);
      const rightPercent = 100 - leftPercent;
      const leadingLetter = score >= 0 ? meta.letters[0] : meta.letters[1];
      const leadingPercent = score >= 0 ? leftPercent : rightPercent;

      return {
        key,
        leftLetter: meta.letters[0],
        rightLetter: meta.letters[1],
        leftPercent,
        rightPercent,
        leadingLetter,
        leadingPercent
      };
    });

    const type = scales.map((scale) => scale.leadingLetter).join("");
    return { type, scales };
  }

  async function handleShare() {
    const result = calculateResult();
    const characters = CHARACTERS[result.type] || {
      main: "Spike Spiegel",
      others: ["Vash the Stampede", "Mugen", "Kakashi Hatake"]
    };
    const shareText = [
      `Мой результат в Anime MBTI Test: ${result.type}`,
      `Главный персонаж: ${characters.main}`,
      `Похожие персонажи: ${characters.others.join(", ")}`
    ].join("\n");
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://t.me")}&text=${encodeURIComponent(shareText)}`;

    try {
      if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "Anime MBTI Test",
          text: shareText
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        elements.shareFeedback.textContent = "Результат скопирован в буфер обмена.";
        return;
      }

      elements.shareFeedback.textContent = shareText;
    } catch (error) {
      elements.shareFeedback.textContent = "Не удалось поделиться результатом. Попробуй еще раз.";
    }
  }

  function hasAnswers() {
    return state.answers.some((answer) => answer !== null);
  }

  function resetState() {
    state.answers = Array(QUESTIONS.length).fill(null);
    state.currentQuestion = 0;
    state.completed = false;
    saveState();
  }

  function loadState() {
    try {
      const rawState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const answers = Array.from({ length: QUESTIONS.length }, (_, index) => {
        const value = rawState.answers?.[index];
        return typeof value === "number" && ANSWER_VALUES.includes(value) ? value : null;
      });

      return {
        answers,
        currentQuestion: clamp(Number(rawState.currentQuestion) || 0, 0, QUESTIONS.length - 1),
        completed: Boolean(rawState.completed)
      };
    } catch (error) {
      return {
        answers: Array(QUESTIONS.length).fill(null),
        currentQuestion: 0,
        completed: false
      };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Unable to save progress", error);
    }
  }

  function initTelegram() {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
