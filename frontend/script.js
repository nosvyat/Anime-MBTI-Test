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
    selectedMode: "medium",
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
    auraRow: document.getElementById("aura-row"),
    modeFocusPanel: document.getElementById("mode-focus-panel"),
    selectedModeName: document.getElementById("selected-mode-name"),
    selectedModeMeta: document.getElementById("selected-mode-meta"),
    selectedModeDescription: document.getElementById("selected-mode-description"),
    selectedModeNote: document.getElementById("selected-mode-note"),
    modeCtaButton: document.getElementById("mode-cta-button"),
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
  bindEvents();
  initializeApp();

  async function initializeApp() {
    setNetworkStatus();
    state.user = initTelegram();

    await api.upsertUser(state.user);
    await api.syncPendingSession(state.user);

    state.resumeSession = await api.getActiveSession(state.user.telegramId);
    state.latestResult = await api.getLatestResult(state.user.telegramId);
    hydrateSelectedMode();
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
    elements.auraRow.addEventListener("click", handleAuraSelection);
    elements.modeCtaButton.addEventListener("click", handleModeCta);
    elements.backButton.addEventListener("click", handleBack);
    elements.nextButton.addEventListener("click", handleNext);
    elements.shareButton.addEventListener("click", handleShare);
    elements.historyButton.addEventListener("click", openHistory);
    elements.restartButton.addEventListener("click", handleRestart);
    elements.closeHistoryButton.addEventListener("click", closeHistory);
    elements.historyCloseBackdrop.addEventListener("click", closeHistory);

    window.addEventListener("online", handleConnectivityChange);
    window.addEventListener("offline", handleConnectivityChange);
  }

  function handleConnectivityChange() {
    setNetworkStatus();
    renderSyncChip();

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
      showScreen("result-screen");
    }

    hydrateSelectedMode();
    renderStartState();
    renderSyncChip();
  }

  function hydrateSelectedMode() {
    const availableModes = new Set(questionData.modeOptions.map((mode) => mode.key));
    const preferredMode = state.resumeSession?.mode || state.selectedMode || state.latestResult?.mode || "medium";
    state.selectedMode = availableModes.has(preferredMode) ? preferredMode : "medium";
  }

  function getModeDetails(modeKey = state.selectedMode) {
    return questionData.modeOptions.find((mode) => mode.key === modeKey) || questionData.modeOptions[0];
  }

  function renderStartState() {
    renderAuraModes();
    renderModeFocus();
    renderSyncChip();
  }

  function renderAuraModes() {
    elements.auraRow.innerHTML = "";

    questionData.modeOptions.forEach((mode) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `mode-aura mode-aura--${mode.accent}`;
      button.dataset.mode = mode.key;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(mode.key === state.selectedMode));
      button.innerHTML = `
        <span class="mode-aura__orb" aria-hidden="true"></span>
        <span class="mode-aura__label">${mode.title}</span>
        <span class="mode-aura__detail">${mode.duration}</span>
      `;

      if (mode.key === state.selectedMode) {
        button.classList.add("is-selected");
      }

      elements.auraRow.appendChild(button);
    });
  }

  function renderModeFocus() {
    const selectedMode = getModeDetails();
    const hasResumeForSelected = state.resumeSession?.mode === selectedMode.key;
    const resumeLabel = state.resumeSession
      ? getModeDetails(state.resumeSession.mode)?.title || state.resumeSession.mode
      : null;

    elements.selectedModeName.textContent = selectedMode.title;
    elements.selectedModeMeta.textContent = `${selectedMode.subtitle} - ${selectedMode.duration}`;
    elements.selectedModeDescription.textContent = selectedMode.description;
    elements.modeFocusPanel.dataset.accent = selectedMode.accent;
    elements.modeCtaButton.dataset.accent = selectedMode.accent;

    if (hasResumeForSelected) {
      elements.selectedModeNote.textContent = `Resume from question ${state.resumeSession.currentQuestionIndex + 1} of ${state.resumeSession.totalQuestions}.`;
      elements.selectedModeNote.classList.remove("hidden");
      elements.modeCtaButton.textContent = `Continue ${selectedMode.title} Depth`;
    } else if (state.resumeSession) {
      elements.selectedModeNote.textContent = `An unfinished ${resumeLabel} session is saved. Starting here will replace it.`;
      elements.selectedModeNote.classList.remove("hidden");
      elements.modeCtaButton.textContent = selectedMode.ctaLabel;
    } else {
      elements.selectedModeNote.textContent = "";
      elements.selectedModeNote.classList.add("hidden");
      elements.modeCtaButton.textContent = selectedMode.ctaLabel;
    }
  }

  function handleAuraSelection(event) {
    const trigger = event.target.closest("[data-mode]");

    if (!trigger) {
      return;
    }

    state.selectedMode = trigger.dataset.mode;
    renderStartState();
  }

  async function handleModeCta() {
    const selectedMode = getModeDetails();

    if (state.resumeSession?.mode === selectedMode.key) {
      await resumeSessionFlow();
      return;
    }

    await startMode(selectedMode.key);
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
      const shouldReplace = window.confirm("You already have an unfinished session. Start a new one and replace the saved progress?");

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
    state.selectedMode = mode;
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
    state.selectedMode = state.resumeSession.mode;
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
      state.selectedMode = state.session.mode;
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
    state.selectedMode = state.result.mode;
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

      return {
        scaleType,
        leftSide,
        rightSide,
        leftPercent,
        rightPercent: 100 - leftPercent,
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
      summaryText: `${type} - ${typeProfile.name}. ${typeProfile.description}`,
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
      summaryText: payload.summaryText || payload.calculation?.summaryText || `${type} - ${typeProfile.name}. ${typeProfile.description}`,
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

  function renderQuestion() {
    if (!state.session || !state.questions.length) {
      return;
    }

    const index = state.session.currentQuestionIndex;
    const question = state.questions[index];
    const answer = state.session.answers[index];
    const progress = ((index + 1) / state.questions.length) * 100;

    elements.modeBadge.textContent = getModeDetails(state.mode)?.title || state.mode;
    elements.questionCounter.textContent = `Question ${index + 1} of ${state.questions.length}`;
    elements.progressFill.style.width = `${progress}%`;
    elements.questionTypeBadge.textContent = questionData.scaleLabels[question.scaleType];
    elements.questionText.textContent = question.text;
    elements.answerHint.textContent = typeof answer === "number"
      ? questionData.answerOptions.find((option) => option.value === answer)?.label || "Answer saved"
      : "Choose one option to continue.";
    elements.nextButton.textContent = index === state.questions.length - 1 ? "Show Result" : "Next";
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
    const modeLabel = getModeDetails(result.mode)?.title || result.mode;
    const mainCharacter = result.mainCharacter || {
      name: "Character loading",
      anime: "Anime MBTI",
      description: "Character details will appear after synchronization.",
      imageUrl: "https://placehold.co/720x880/0e162d/f4f7ff?text=Anime+MBTI",
      traits: ["Pending", "Sync", "Cache"]
    };

    elements.resultType.textContent = result.type;
    elements.resultTypeName.textContent = result.typeProfile?.name || result.type;
    elements.resultTypeDescription.textContent = result.typeProfile?.description || "A unique combination of personality traits.";
    elements.resultSummary.textContent = result.summaryText;
    elements.resultModeBadge.textContent = modeLabel;
    elements.mainCharacterImage.src = mainCharacter.imageUrl;
    elements.mainCharacterImage.alt = mainCharacter.name;
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
      empty.innerHTML = "<p>No history yet. Finish a test to create your first result.</p>";
      elements.historyList.appendChild(empty);
      return;
    }

    state.history.forEach((entry) => {
      const item = normalizeResult(entry, entry.mode);
      const historyCard = document.createElement("article");
      historyCard.className = "history-item";
      historyCard.innerHTML = `
        <div class="history-top">
          <strong>${item.type} - ${item.typeProfile?.name || item.type}</strong>
          <span class="history-meta">${formatDate(item.createdAt)}</span>
        </div>
        <div class="history-body">
          <img class="history-avatar" src="${item.mainCharacter?.iconUrl || "https://placehold.co/96x96/18233f/eef3ff?text=MB"}" alt="${item.mainCharacter?.name || "Character"}">
          <div>
            <h3>${item.mainCharacter?.name || "Main Character"}</h3>
            <p>${getModeDetails(item.mode)?.title || item.mode} mode</p>
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

    const shareText = `I took the Anime MBTI Test! My type is ${state.result.type}, and my character is ${state.result.mainCharacter?.name || "Unknown"}.`;
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
      elements.shareFeedback.textContent = "Result text copied to clipboard.";
    } catch (error) {
      elements.shareFeedback.textContent = "Could not share the result. Please try again.";
    }
  }

  function handleRestart() {
    state.session = null;
    state.result = null;
    state.historyLoaded = false;
    hydrateSelectedMode();
    renderStartState();
    showScreen("start-screen");
    syncRemoteState();
  }

  function renderSyncChip() {
    if (!elements.syncChip) {
      return;
    }

    if (!state.session && !state.resumeSession) {
      elements.syncChip.textContent = navigator.onLine ? "Server connected" : "Offline mode";
      return;
    }

    const session = state.session || state.resumeSession;
    elements.syncChip.textContent = session?.synced === false
      ? "Offline: waiting for sync"
      : "Progress saved to server";
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

    return new Intl.DateTimeFormat("en-US", {
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
