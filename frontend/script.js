(() => {
  const questionData = window.APP_QUESTION_DATA;
  const characterData = window.APP_CHARACTER_DATA;
  const api = window.AnimeMbtiApi;

  if (!questionData || !characterData || !api) {
    return;
  }

  const scaleSides = {
    EI: ["E", "I"],
    NS: ["N", "S"],
    TF: ["T", "F"],
    JP: ["J", "P"]
  };

  const state = {
    user: null,
    mode: null,
    questions: [],
    session: null,
    resumeSession: null,
    result: null,
    latestResult: null,
    history: [],
    historyLoaded: false
  };

  const elements = {
    screens: document.querySelectorAll(".screen"),
    networkStatus: document.getElementById("network-status"),
    userName: document.getElementById("user-name"),
    userMeta: document.getElementById("user-meta"),
    modeGrid: document.getElementById("mode-grid"),
    resumeCard: document.getElementById("resume-card"),
    resumeTitle: document.getElementById("resume-title"),
    resumeMeta: document.getElementById("resume-meta"),
    resumeButton: document.getElementById("resume-button"),
    restartActiveButton: document.getElementById("restart-active-button"),
    lastResultCard: document.getElementById("last-result-card"),
    lastResultDate: document.getElementById("last-result-date"),
    lastResultType: document.getElementById("last-result-type"),
    lastResultCharacter: document.getElementById("last-result-character"),
    lastResultSummary: document.getElementById("last-result-summary"),
    openHistoryButton: document.getElementById("open-history-button"),
    backButton: document.getElementById("back-button"),
    syncChip: document.getElementById("sync-chip"),
    modeBadge: document.getElementById("mode-badge"),
    questionCounter: document.getElementById("question-counter"),
    progressFill: document.getElementById("progress-fill"),
    questionTypeBadge: document.getElementById("question-type-badge"),
    questionText: document.getElementById("question-text"),
    answerScale: document.getElementById("answer-scale"),
    answerHint: document.getElementById("answer-hint"),
    nextButton: document.getElementById("next-button"),
    resultType: document.getElementById("result-type"),
    resultTypeName: document.getElementById("result-type-name"),
    resultTypeDescription: document.getElementById("result-type-description"),
    resultSummary: document.getElementById("result-summary"),
    resultModeBadge: document.getElementById("result-mode-badge"),
    mainCharacterImage: document.getElementById("main-character-image"),
    mainCharacterName: document.getElementById("main-character-name"),
    mainCharacterAnime: document.getElementById("main-character-anime"),
    mainCharacterDescription: document.getElementById("main-character-description"),
    mainCharacterTraits: document.getElementById("main-character-traits"),
    similarCharacters: document.getElementById("similar-characters"),
    scoreList: document.getElementById("score-list"),
    shareButton: document.getElementById("share-button"),
    historyButton: document.getElementById("history-button"),
    restartButton: document.getElementById("restart-button"),
    shareFeedback: document.getElementById("share-feedback"),
    historyModal: document.getElementById("history-modal"),
    historyList: document.getElementById("history-list"),
    closeHistoryButton: document.getElementById("close-history-button"),
    historyCloseBackdrop: document.getElementById("history-close-backdrop")
  };

  createAnswerButtons();
  renderModeCards();
  bindEvents();
  initializeApp();

  async function initializeApp() {
    setNetworkStatus();
    state.user = initTelegram();
    renderUser();

    await api.upsertUser(state.user);
    await api.syncPendingSession(state.user);

    state.resumeSession = await api.getActiveSession(state.user.telegramId);
    state.latestResult = await api.getLatestResult(state.user.telegramId);

    renderStartState();
  }

  function initTelegram() {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }

    const telegramUser = webApp?.initDataUnsafe?.user;
    if (telegramUser?.id) {
      return {
        telegramId: String(telegramUser.id),
        username: telegramUser.username || null,
        firstName: telegramUser.first_name || "Telegram User",
        lastName: telegramUser.last_name || null
      };
    }

    return {
      telegramId: "local-demo-user",
      username: "local_demo",
      firstName: "Local",
      lastName: "Tester"
    };
  }

  function bindEvents() {
    elements.resumeButton.addEventListener("click", resumeSessionFlow);
    elements.restartActiveButton.addEventListener("click", async () => {
      if (!state.resumeSession) {
        return;
      }

      await startMode(state.resumeSession.mode, true);
    });
    elements.backButton.addEventListener("click", handleBack);
    elements.nextButton.addEventListener("click", handleNext);
    elements.shareButton.addEventListener("click", handleShare);
    elements.historyButton.addEventListener("click", openHistory);
    elements.restartButton.addEventListener("click", handleRestart);
    elements.openHistoryButton.addEventListener("click", openHistory);
    elements.closeHistoryButton.addEventListener("click", closeHistory);
    elements.historyCloseBackdrop.addEventListener("click", closeHistory);

    window.addEventListener("online", handleConnectivityChange);
    window.addEventListener("offline", handleConnectivityChange);
  }

  function handleConnectivityChange() {
    setNetworkStatus();
    if (navigator.onLine) {
      syncRemoteState();
    }
  }

  async function syncRemoteState() {
    if (!state.user) {
      return;
    }

    const synced = await api.syncPendingSession(state.user);
    state.resumeSession = await api.getActiveSession(state.user.telegramId);
    state.latestResult = await api.getLatestResult(state.user.telegramId);

    if (synced?.mbtiType) {
      state.result = normalizeResult(synced);
      renderResult();
    }

    renderStartState();
    renderSyncChip();
  }

  function renderUser() {
    const displayName = state.user.username
      ? `@${state.user.username}`
      : `${state.user.firstName}${state.user.lastName ? ` ${state.user.lastName}` : ""}`;

    elements.userName.textContent = displayName;
    elements.userMeta.textContent = state.user.telegramId === "local-demo-user"
      ? "Локальный test-mode без Telegram user data"
      : `Telegram ID: ${state.user.telegramId}`;
  }

  function renderModeCards() {
    elements.modeGrid.innerHTML = "";

    questionData.modeOptions.forEach((mode) => {
      const card = document.createElement("article");
      card.className = "mode-card";
      card.innerHTML = `
        <div class="mode-card-header">
          <div>
            <h3>${mode.title}</h3>
            <p>${mode.subtitle}</p>
          </div>
          <div class="mode-badge">${mode.key}</div>
        </div>
        <p>${mode.description}</p>
        <button class="primary-button" type="button" data-mode="${mode.key}">Выбрать ${mode.title}</button>
      `;
      elements.modeGrid.appendChild(card);
    });

    elements.modeGrid.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => startMode(button.dataset.mode));
    });
  }

  function createAnswerButtons() {
    elements.answerScale.innerHTML = "";

    questionData.answerOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      button.dataset.value = String(option.value);
      button.textContent = option.value > 0 ? `+${option.value}` : String(option.value);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-label", option.label);
      button.setAttribute("aria-checked", "false");
      button.addEventListener("click", () => handleAnswer(option.value));
      elements.answerScale.appendChild(button);
    });
  }

  async function startMode(mode, replaceExisting = false) {
    if (state.resumeSession && !replaceExisting) {
      const shouldReplace = window.confirm("У тебя есть незавершённая сессия. Начать новую и сбросить текущий прогресс?");
      if (!shouldReplace) {
        return;
      }
    }

    const session = await api.startSession({
      telegramId: state.user.telegramId,
      username: state.user.username,
      firstName: state.user.firstName,
      lastName: state.user.lastName,
      mode
    });

    const bundle = await api.getQuestions(mode);
    state.mode = mode;
    state.questions = bundle.questions;
    state.session = ensureSessionShape(session, bundle.totalQuestions);
    state.resumeSession = state.session;
    state.result = null;

    showScreen("test-screen");
    renderQuestion();
  }

  async function resumeSessionFlow() {
    if (!state.resumeSession) {
      return;
    }

    const bundle = await api.getQuestions(state.resumeSession.mode);
    state.mode = state.resumeSession.mode;
    state.questions = bundle.questions;
    state.session = ensureSessionShape(state.resumeSession, bundle.totalQuestions);
    showScreen("test-screen");
    renderQuestion();
  }

  function ensureSessionShape(session, totalQuestions) {
    return {
      ...session,
      answers: Array.from({ length: totalQuestions }, (_, index) => {
        const value = session.answers?.[index];
        return typeof value === "number" ? value : null;
      })
    };
  }

  async function handleAnswer(value) {
    if (!state.session) {
      return;
    }

    const questionIndex = state.session.currentQuestionIndex;
    state.session.answers[questionIndex] = value;
    renderQuestion();

    state.session = await api.saveAnswer(state.session, questionIndex, value);
    state.resumeSession = state.session;
    renderSyncChip();
  }

  async function handleNext() {
    if (!state.session) {
      return;
    }

    const answer = state.session.answers[state.session.currentQuestionIndex];
    if (typeof answer !== "number") {
      return;
    }

    if (state.session.currentQuestionIndex >= state.questions.length - 1) {
      await finishSession();
      return;
    }

    state.session.currentQuestionIndex += 1;
    renderQuestion();
    state.session = await api.updateProgress(state.session, state.session.currentQuestionIndex);
    state.resumeSession = state.session;
    renderSyncChip();
  }

  async function handleBack() {
    if (!state.session) {
      return;
    }

    if (state.session.currentQuestionIndex === 0) {
      state.resumeSession = state.session;
      renderStartState();
      showScreen("start-screen");
      return;
    }

    state.session.currentQuestionIndex -= 1;
    renderQuestion();
    state.session = await api.updateProgress(state.session, state.session.currentQuestionIndex);
    state.resumeSession = state.session;
    renderSyncChip();
  }

  async function finishSession() {
    const provisionalResult = await buildLocalResult();
    const payload = await api.completeSession(state.session, provisionalResult);
    state.result = normalizeResult(payload, state.mode);
    state.latestResult = state.result;
    state.resumeSession = null;
    state.session = null;
    renderResult();
    showScreen("result-screen");
  }

  async function buildLocalResult() {
    const totals = { EI: 0, NS: 0, TF: 0, JP: 0 };
    const counts = { EI: 0, NS: 0, TF: 0, JP: 0 };

    state.questions.forEach((question, index) => {
      const value = Number(state.session.answers[index] ?? 0);
      const [leftSide] = scaleSides[question.scaleType];
      const normalized = question.directSide === leftSide ? value : value * -1;
      totals[question.scaleType] += normalized;
      counts[question.scaleType] += 1;
    });

    const scales = Object.entries(scaleSides).map(([scaleType, [leftSide, rightSide]]) => {
      const maxAbs = Math.max(counts[scaleType] * 3, 1);
      const score = totals[scaleType];
      const leftPercent = clamp(Math.round(((score + maxAbs) / (maxAbs * 2)) * 100), 0, 100);
      const rightPercent = 100 - leftPercent;
      return {
        scaleType,
        leftSide,
        rightSide,
        leftPercent,
        rightPercent,
        dominantSide: score >= 0 ? leftSide : rightSide,
        rawScore: score
      };
    });

    const type = scales.map((scale) => scale.dominantSide).join("");
    const characterPackage = await api.getCharactersByType(type);
    const typeProfile = characterPackage.typeProfile || {
      code: type,
      ...characterData.typeDetails[type]
    };

    return {
      type,
      typeProfile,
      mode: state.mode,
      createdAt: new Date().toISOString(),
      sessionId: state.session.id,
      summaryText: `${type} — ${typeProfile.name}. ${typeProfile.description}`,
      scales,
      mainCharacter: characterPackage.main,
      similarCharacters: characterPackage.others
    };
  }

  function normalizeResult(payload, fallbackMode = null) {
    if (!payload) {
      return null;
    }

    const type = payload.mbtiType || payload.type;
    const typeProfile = payload.typeProfile || payload.profile || {
      code: type,
      ...characterData.typeDetails[type]
    };
    const scales = payload.scales || payload.calculation?.scales || buildScalesFromPercentages(payload.percentages);

    return {
      id: payload.id || null,
      sessionId: payload.sessionId || payload.session?.id || null,
      type,
      typeProfile,
      mode: payload.mode || fallbackMode || payload.session?.mode || "quick",
      summaryText: payload.summaryText || payload.calculation?.summaryText || `${type} — ${typeProfile.name}. ${typeProfile.description}`,
      scales,
      mainCharacter: payload.mainCharacter || null,
      similarCharacters: payload.similarCharacters || payload.others || [],
      createdAt: payload.createdAt || new Date().toISOString()
    };
  }

  function buildScalesFromPercentages(percentages) {
    return Object.entries(scaleSides).map(([scaleType, [leftSide, rightSide]]) => {
      const value = percentages?.[scaleType];
      const leftPercent = typeof value === "number"
        ? value
        : typeof value?.[leftSide] === "number"
          ? value[leftSide]
          : 50;

      return {
        scaleType,
        leftSide,
        rightSide,
        leftPercent,
        rightPercent: 100 - leftPercent,
        dominantSide: leftPercent >= 50 ? leftSide : rightSide,
        rawScore: null
      };
    });
  }

  function renderStartState() {
    renderResumeCard();
    renderLastResultCard();
    renderSyncChip();
  }

  function renderResumeCard() {
    if (!state.resumeSession) {
      elements.resumeCard.classList.add("hidden");
      return;
    }

    elements.resumeCard.classList.remove("hidden");
    const modeLabel = questionData.modeOptions.find((mode) => mode.key === state.resumeSession.mode)?.title || state.resumeSession.mode;
    elements.resumeTitle.textContent = `${modeLabel} session`;
    elements.resumeMeta.textContent = `Вопрос ${state.resumeSession.currentQuestionIndex + 1} из ${state.resumeSession.totalQuestions}`;
  }

  function renderLastResultCard() {
    if (!state.latestResult) {
      elements.lastResultCard.classList.add("hidden");
      return;
    }

    const result = normalizeResult(state.latestResult);
    elements.lastResultCard.classList.remove("hidden");
    elements.lastResultDate.textContent = formatDate(result.createdAt);
    elements.lastResultType.textContent = result.type;
    elements.lastResultCharacter.textContent = result.mainCharacter?.name || "Главный персонаж скоро появится";
    elements.lastResultSummary.textContent = result.summaryText;
  }

  function renderQuestion() {
    if (!state.session || !state.questions.length) {
      return;
    }

    const index = state.session.currentQuestionIndex;
    const question = state.questions[index];
    const answer = state.session.answers[index];
    const progress = ((index + 1) / state.questions.length) * 100;

    elements.modeBadge.textContent = questionData.modeOptions.find((item) => item.key === state.mode)?.title || state.mode;
    elements.questionCounter.textContent = `Вопрос ${index + 1} из ${state.questions.length}`;
    elements.progressFill.style.width = `${progress}%`;
    elements.questionTypeBadge.textContent = questionData.scaleLabels[question.scaleType];
    elements.questionText.textContent = question.text;
    elements.answerHint.textContent = typeof answer === "number"
      ? questionData.answerOptions.find((option) => option.value === answer)?.label || "Ответ сохранён"
      : "Выбери один вариант, чтобы продолжить.";
    elements.nextButton.textContent = index === state.questions.length - 1 ? "Показать результат" : "Далее";
    elements.nextButton.disabled = typeof answer !== "number";
    syncAnswerButtons(answer);
    renderSyncChip();
  }

  function syncAnswerButtons(selectedValue) {
    elements.answerScale.querySelectorAll(".answer-option").forEach((button) => {
      const isSelected = Number(button.dataset.value) === selectedValue;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-checked", String(isSelected));
    });
  }

  function renderResult() {
    if (!state.result) {
      return;
    }

    const result = state.result;
    const modeLabel = questionData.modeOptions.find((mode) => mode.key === result.mode)?.title || result.mode;
    const mainCharacter = result.mainCharacter || {
      name: "Character loading",
      anime: "Anime MBTI",
      description: "Данные персонажа появятся после синхронизации.",
      imageUrl: "https://placehold.co/720x880/0e162d/f4f7ff?text=Anime+MBTI",
      traits: ["Pending", "Sync", "Cache"]
    };

    elements.resultType.textContent = result.type;
    elements.resultTypeName.textContent = result.typeProfile?.name || result.type;
    elements.resultTypeDescription.textContent = result.typeProfile?.description || "Уникальная комбинация черт личности.";
    elements.resultSummary.textContent = result.summaryText;
    elements.resultModeBadge.textContent = modeLabel;
    elements.mainCharacterImage.src = mainCharacter.imageUrl;
    elements.mainCharacterName.textContent = mainCharacter.name;
    elements.mainCharacterAnime.textContent = mainCharacter.anime;
    elements.mainCharacterDescription.textContent = mainCharacter.description;
    elements.shareFeedback.textContent = "";

    renderTraits(elements.mainCharacterTraits, mainCharacter.traits || []);
    renderSimilarCharacters(result.similarCharacters || []);
    renderScores(result.scales || []);
  }

  function renderTraits(container, traits) {
    container.innerHTML = "";
    traits.forEach((trait) => {
      const pill = document.createElement("span");
      pill.className = "trait-pill";
      pill.textContent = trait;
      container.appendChild(pill);
    });
  }

  function renderSimilarCharacters(characters) {
    elements.similarCharacters.innerHTML = "";

    characters.forEach((character) => {
      const card = document.createElement("article");
      card.className = "similar-card";
      card.innerHTML = `
        <img src="${character.iconUrl}" alt="${character.name}">
        <div>
          <h3>${character.name}</h3>
          <p>${character.anime}</p>
        </div>
      `;
      elements.similarCharacters.appendChild(card);
    });
  }

  function renderScores(scales) {
    elements.scoreList.innerHTML = "";

    scales.forEach((scale) => {
      const card = document.createElement("article");
      card.className = "score-card";
      card.innerHTML = `
        <div class="score-head">
          <span>${scale.leftSide} / ${scale.rightSide}</span>
          <span>${scale.dominantSide} ${Math.max(scale.leftPercent, scale.rightPercent)}%</span>
        </div>
        <div class="score-bar">
          <div class="score-bar-fill" style="width: ${scale.leftPercent}%"></div>
        </div>
        <div class="score-footer">
          <span>${scale.leftSide}: ${scale.leftPercent}%</span>
          <span>${scale.rightSide}: ${scale.rightPercent}%</span>
        </div>
      `;
      elements.scoreList.appendChild(card);
    });
  }

  async function openHistory() {
    if (!state.historyLoaded) {
      state.history = await api.getHistory(state.user.telegramId);
      state.historyLoaded = true;
    }

    renderHistory();
    elements.historyModal.classList.remove("hidden");
    elements.historyModal.setAttribute("aria-hidden", "false");
  }

  function closeHistory() {
    elements.historyModal.classList.add("hidden");
    elements.historyModal.setAttribute("aria-hidden", "true");
  }

  function renderHistory() {
    elements.historyList.innerHTML = "";

    if (!state.history.length) {
      const empty = document.createElement("article");
      empty.className = "history-item";
      empty.innerHTML = "<p>История пока пустая. Пройди тест хотя бы один раз.</p>";
      elements.historyList.appendChild(empty);
      return;
    }

    state.history.forEach((entry) => {
      const item = normalizeResult(entry, entry.mode);
      const historyCard = document.createElement("article");
      historyCard.className = "history-item";
      historyCard.innerHTML = `
        <div class="history-top">
          <strong>${item.type} · ${item.typeProfile?.name || item.type}</strong>
          <span class="history-meta">${formatDate(item.createdAt)}</span>
        </div>
        <div class="history-body">
          <img class="history-avatar" src="${item.mainCharacter?.iconUrl || "https://placehold.co/96x96/18233f/eef3ff?text=MB"}" alt="${item.mainCharacter?.name || "Character"}">
          <div>
            <h3>${item.mainCharacter?.name || "Главный персонаж"}</h3>
            <p>${questionData.modeOptions.find((mode) => mode.key === item.mode)?.title || item.mode} mode</p>
            <p>${item.summaryText}</p>
          </div>
        </div>
      `;
      elements.historyList.appendChild(historyCard);
    });
  }

  async function handleShare() {
    if (!state.result) {
      return;
    }

    const shareText = `Я прошёл Anime MBTI Test! Мой тип — ${state.result.type}, мой персонаж — ${state.result.mainCharacter?.name || "Unknown"}`;
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

      await navigator.clipboard.writeText(shareText);
      elements.shareFeedback.textContent = "Текст результата скопирован в буфер обмена.";
    } catch (error) {
      elements.shareFeedback.textContent = "Не удалось поделиться результатом. Попробуй ещё раз.";
    }
  }

  function handleRestart() {
    state.session = null;
    state.result = null;
    state.historyLoaded = false;
    showScreen("start-screen");
    syncRemoteState();
  }

  function renderSyncChip() {
    if (!state.session && !state.resumeSession) {
      elements.syncChip.textContent = navigator.onLine ? "Сервер доступен" : "Оффлайн режим";
      return;
    }

    const session = state.session || state.resumeSession;
    elements.syncChip.textContent = session?.synced === false
      ? "Оффлайн: ждём синхронизацию"
      : "Прогресс сохранён на сервере";
  }

  function setNetworkStatus() {
    elements.networkStatus.textContent = navigator.onLine ? "Online" : "Offline";
  }

  function showScreen(screenId) {
    elements.screens.forEach((screen) => {
      screen.classList.toggle("is-visible", screen.id === screenId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formatDate(value) {
    const date = new Date(value || Date.now());
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
