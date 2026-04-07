(() => {
  const uiData = window.APP_UI_DATA;
  const questionData = window.APP_QUESTION_DATA;
  const characterData = window.APP_CHARACTER_DATA;
  const api = window.AnimeMbtiApi;

  if (!uiData || !questionData || !characterData || !api) {
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
    activeView: "test",
    selectedMode: "medium",
    selectedTypeCode: "INTJ",
    mode: null,
    questions: [],
    session: null,
    resumeSession: null,
    result: null,
    latestResult: null,
    history: []
  };

  const elements = {
    screens: document.querySelectorAll(".screen"),
    welcomeBadge: document.getElementById("welcome-badge"),
    welcomeTitle: document.getElementById("welcome-title"),
    welcomeSubtitle: document.getElementById("welcome-subtitle"),
    welcomeCtaButton: document.getElementById("welcome-cta-button"),
    viewEyebrow: document.getElementById("view-eyebrow"),
    viewTitle: document.getElementById("view-title"),
    networkStatus: document.getElementById("network-status"),
    tabbar: document.getElementById("tabbar"),
    appViews: document.querySelectorAll(".app-view"),
    auraRow: document.getElementById("aura-row"),
    modeFocusPanel: document.getElementById("mode-focus-panel"),
    selectedModeName: document.getElementById("selected-mode-name"),
    selectedModeMeta: document.getElementById("selected-mode-meta"),
    selectedModeDescription: document.getElementById("selected-mode-description"),
    selectedModeNote: document.getElementById("selected-mode-note"),
    modeCtaButton: document.getElementById("mode-cta-button"),
    typesGrid: document.getElementById("types-grid"),
    profileAvatar: document.getElementById("profile-avatar"),
    profileName: document.getElementById("profile-name"),
    profileUsername: document.getElementById("profile-username"),
    profileTelegramId: document.getElementById("profile-telegram-id"),
    profileLastResultType: document.getElementById("profile-last-result-type"),
    profileLastResultName: document.getElementById("profile-last-result-name"),
    profileLastResultSummary: document.getElementById("profile-last-result-summary"),
    profileLastResultDate: document.getElementById("profile-last-result-date"),
    profileCurrentTypeCode: document.getElementById("profile-current-type-code"),
    profileCurrentTypeName: document.getElementById("profile-current-type-name"),
    profileCurrentTypeDescription: document.getElementById("profile-current-type-description"),
    profileTestsCount: document.getElementById("profile-tests-count"),
    profileLastMode: document.getElementById("profile-last-mode"),
    profileHistoryList: document.getElementById("profile-history-list"),
    profileAboutTitle: document.getElementById("profile-about-title"),
    profileAboutText: document.getElementById("profile-about-text"),
    profileRestartButton: document.getElementById("profile-restart-button"),
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
    resultProfileButton: document.getElementById("result-profile-button"),
    restartButton: document.getElementById("restart-button"),
    shareFeedback: document.getElementById("share-feedback"),
    closeTypeDetailButton: document.getElementById("close-type-detail-button"),
    detailTypeCode: document.getElementById("detail-type-code"),
    detailTypeName: document.getElementById("detail-type-name"),
    detailTypeDescription: document.getElementById("detail-type-description"),
    detailStrengths: document.getElementById("detail-strengths"),
    detailWeaknesses: document.getElementById("detail-weaknesses"),
    detailCommunication: document.getElementById("detail-communication"),
    detailRelationships: document.getElementById("detail-relationships"),
    detailWork: document.getElementById("detail-work")
  };

  createAnswerButtons();
  bindEvents();
  initializeApp();

  async function initializeApp() {
    applyWelcomeCopy();
    renderTabbar();
    setNetworkStatus();

    state.user = initTelegram();
    elements.profileAboutTitle.textContent = uiData.profile.aboutTitle;
    elements.profileAboutText.textContent = `${uiData.profile.aboutText} ${uiData.profile.settingsText}`;

    await api.upsertUser(state.user);
    await api.syncPendingSession(state.user);

    const [resumeSession, latestResultRaw, historyRaw] = await Promise.all([
      api.getActiveSession(state.user.telegramId),
      api.getLatestResult(state.user.telegramId),
      api.getHistory(state.user.telegramId)
    ]);

    state.resumeSession = resumeSession;
    state.latestResult = normalizeResult(latestResultRaw);
    state.history = Array.isArray(historyRaw)
      ? historyRaw.map((entry) => normalizeResult(entry, entry.mode)).filter(Boolean)
      : [];

    hydrateSelectedMode();
    hydrateSelectedType();
    renderApp();
  }

  function applyWelcomeCopy() {
    elements.welcomeBadge.textContent = uiData.welcome.badge;
    elements.welcomeTitle.textContent = uiData.welcome.title;
    elements.welcomeSubtitle.textContent = uiData.welcome.subtitle;
    elements.welcomeCtaButton.textContent = uiData.welcome.ctaLabel;
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
        firstName: telegramUser.first_name || "Пользователь Telegram",
        lastName: telegramUser.last_name || null,
        photoUrl: telegramUser.photo_url || null
      };
    }

    return {
      telegramId: "local-demo-user",
      username: "anime_mbti_demo",
      firstName: "Локальный",
      lastName: "пользователь",
      photoUrl: null
    };
  }

  function bindEvents() {
    elements.welcomeCtaButton.addEventListener("click", () => {
      state.activeView = "test";
      showScreen("hub-screen");
      renderApp();
    });

    elements.tabbar.addEventListener("click", handleTabClick);
    elements.auraRow.addEventListener("click", handleAuraSelection);
    elements.modeCtaButton.addEventListener("click", handleModeCta);
    elements.profileRestartButton.addEventListener("click", goToTestHub);
    elements.backButton.addEventListener("click", handleBack);
    elements.nextButton.addEventListener("click", handleNext);
    elements.shareButton.addEventListener("click", handleShare);
    elements.resultProfileButton.addEventListener("click", () => {
      state.activeView = "profile";
      showScreen("hub-screen");
      renderApp();
    });
    elements.restartButton.addEventListener("click", goToTestHub);
    elements.closeTypeDetailButton.addEventListener("click", () => {
      showScreen("hub-screen");
      renderApp();
    });

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
    const [resumeSession, latestResultRaw, historyRaw] = await Promise.all([
      api.getActiveSession(state.user.telegramId),
      api.getLatestResult(state.user.telegramId),
      api.getHistory(state.user.telegramId)
    ]);

    state.resumeSession = resumeSession;
    state.latestResult = normalizeResult(latestResultRaw);
    state.history = Array.isArray(historyRaw)
      ? historyRaw.map((entry) => normalizeResult(entry, entry.mode)).filter(Boolean)
      : [];

    if (synced?.mbtiType) {
      state.result = normalizeResult(synced);
      renderResult();
      showScreen("result-screen");
    }

    hydrateSelectedMode();
    hydrateSelectedType();
    renderApp();
  }

  function hydrateSelectedMode() {
    const availableModes = new Set(questionData.modeOptions.map((mode) => mode.key));
    const preferredMode = state.resumeSession?.mode || state.latestResult?.mode || state.selectedMode || "medium";
    state.selectedMode = availableModes.has(preferredMode) ? preferredMode : "medium";
  }

  function hydrateSelectedType() {
    const preferredType = state.latestResult?.type || state.selectedTypeCode || "INTJ";
    state.selectedTypeCode = characterData.typeProfiles[preferredType] ? preferredType : "INTJ";
  }

  function renderApp() {
    renderHeader();
    renderTabbar();
    renderAppViews();
    renderTestView();
    renderTypesView();
    renderProfileView();
    renderSyncChip();
  }

  function renderHeader() {
    const viewTitle = uiData.viewTitles[state.activeView];
    elements.viewEyebrow.textContent = viewTitle.eyebrow;
    elements.viewTitle.textContent = viewTitle.title;
  }

  function renderTabbar() {
    elements.tabbar.innerHTML = "";

    uiData.tabs.forEach((tab) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tabbar-button";
      button.dataset.view = tab.key;
      button.setAttribute("aria-label", tab.label);
      button.innerHTML = `
        <span class="tabbar-icon" aria-hidden="true">${renderTabIcon(tab.icon)}</span>
        <span class="tabbar-label">${tab.label}</span>
      `;

      if (tab.key === state.activeView) {
        button.classList.add("is-active");
      }

      elements.tabbar.appendChild(button);
    });
  }

  function renderTabIcon(icon) {
    if (icon === "spark") {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3l1.6 4.1L18 8.7l-4.4 1.6L12 14.5l-1.6-4.2L6 8.7l4.4-1.6L12 3z"></path>
        </svg>
      `;
    }

    if (icon === "grid") {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="6" height="6" rx="1.5"></rect>
          <rect x="14" y="4" width="6" height="6" rx="1.5"></rect>
          <rect x="4" y="14" width="6" height="6" rx="1.5"></rect>
          <rect x="14" y="14" width="6" height="6" rx="1.5"></rect>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21a8 8 0 10-16 0"></path>
        <circle cx="12" cy="8" r="4"></circle>
      </svg>
    `;
  }

  function renderAppViews() {
    elements.appViews.forEach((view) => {
      view.classList.toggle("is-active", view.dataset.view === state.activeView);
    });
  }

  function handleTabClick(event) {
    const trigger = event.target.closest("[data-view]");

    if (!trigger) {
      return;
    }

    state.activeView = trigger.dataset.view;
    showScreen("hub-screen");
    renderApp();
  }

  function renderTestView() {
    renderAuraModes();
    renderModeFocus();
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
    const resumeMode = state.resumeSession ? getModeDetails(state.resumeSession.mode) : null;

    elements.selectedModeName.textContent = selectedMode.title;
    elements.selectedModeMeta.textContent = `${selectedMode.subtitle} - ${selectedMode.duration}`;
    elements.selectedModeDescription.textContent = selectedMode.description;
    elements.modeFocusPanel.dataset.accent = selectedMode.accent;
    elements.modeCtaButton.dataset.accent = selectedMode.accent;

    if (hasResumeForSelected) {
      elements.selectedModeNote.textContent = `Есть незавершённая сессия: вопрос ${state.resumeSession.currentQuestionIndex + 1} из ${state.resumeSession.totalQuestions}.`;
      elements.selectedModeNote.classList.remove("hidden");
      elements.modeCtaButton.textContent = "Продолжить тест";
      return;
    }

    if (state.resumeSession && resumeMode) {
      elements.selectedModeNote.textContent = `Сохранён незавершённый режим «${resumeMode.title}». Если начнёшь новый, текущий прогресс заменится.`;
      elements.selectedModeNote.classList.remove("hidden");
      elements.modeCtaButton.textContent = selectedMode.ctaLabel;
      return;
    }

    elements.selectedModeNote.textContent = "";
    elements.selectedModeNote.classList.add("hidden");
    elements.modeCtaButton.textContent = selectedMode.ctaLabel;
  }

  function handleAuraSelection(event) {
    const trigger = event.target.closest("[data-mode]");

    if (!trigger) {
      return;
    }

    state.selectedMode = trigger.dataset.mode;
    renderTestView();
  }

  async function handleModeCta() {
    const selectedMode = getModeDetails();

    if (state.resumeSession?.mode === selectedMode.key) {
      await resumeSessionFlow();
      return;
    }

    await startMode(selectedMode.key);
  }

  function renderTypesView() {
    elements.typesGrid.innerHTML = "";

    Object.values(characterData.typeProfiles).forEach((profile) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "type-card";
      button.dataset.typeCode = profile.code;
      button.innerHTML = `
        <span class="type-card__code">${profile.code}</span>
        <span class="type-card__name">${profile.name}</span>
        <span class="type-card__text">${profile.summary}</span>
      `;
      button.addEventListener("click", () => openTypeDetail(profile.code));
      elements.typesGrid.appendChild(button);
    });
  }

  function openTypeDetail(typeCode) {
    state.selectedTypeCode = typeCode;
    renderTypeDetail();
    showScreen("type-detail-screen");
  }

  function renderTypeDetail() {
    const profile = getTypeProfile(state.selectedTypeCode);

    if (!profile) {
      return;
    }

    elements.detailTypeCode.textContent = profile.code;
    elements.detailTypeName.textContent = profile.name;
    elements.detailTypeDescription.textContent = profile.description;
    renderTagGroup(elements.detailStrengths, profile.strengths);
    renderTagGroup(elements.detailWeaknesses, profile.weaknesses);
    elements.detailCommunication.textContent = profile.communication;
    elements.detailRelationships.textContent = profile.relationships;
    elements.detailWork.textContent = profile.workStudy;
  }

  function renderTagGroup(container, items) {
    container.innerHTML = "";

    items.forEach((item) => {
      const tag = document.createElement("span");
      tag.className = "detail-tag";
      tag.textContent = item;
      container.appendChild(tag);
    });
  }

  function renderProfileView() {
    const displayName = getUserDisplayName();
    const latestResult = state.latestResult;
    const currentTypeProfile = latestResult ? getTypeProfile(latestResult.type) : null;

    elements.profileAvatar.src = getUserAvatar();
    elements.profileName.textContent = displayName;
    elements.profileUsername.textContent = state.user.username ? `@${state.user.username}` : uiData.emptyStates.username;
    elements.profileTelegramId.textContent = `ID Telegram: ${state.user.telegramId}`;

    if (latestResult) {
      elements.profileLastResultType.textContent = latestResult.type;
      elements.profileLastResultName.textContent = `${latestResult.typeProfile.name} — ${latestResult.mainCharacter?.name || "аниме-архетип"}`;
      elements.profileLastResultSummary.textContent = latestResult.summaryText;
      elements.profileLastResultDate.textContent = `Последний раз: ${formatDate(latestResult.createdAt)}`;
      elements.profileCurrentTypeCode.textContent = latestResult.type;
      elements.profileCurrentTypeName.textContent = latestResult.typeProfile.name;
      elements.profileCurrentTypeDescription.textContent = currentTypeProfile?.summary || latestResult.typeProfile.description;
    } else {
      elements.profileLastResultType.textContent = "—";
      elements.profileLastResultName.textContent = uiData.emptyStates.latestResult;
      elements.profileLastResultSummary.textContent = "После прохождения здесь появится твой тип и главный персонаж.";
      elements.profileLastResultDate.textContent = "Ещё не проходил";
      elements.profileCurrentTypeCode.textContent = "—";
      elements.profileCurrentTypeName.textContent = uiData.emptyStates.currentType;
      elements.profileCurrentTypeDescription.textContent = "Сначала заверши тест, чтобы увидеть свой профиль личности.";
    }

    elements.profileTestsCount.textContent = String(state.history.length);
    elements.profileLastMode.textContent = latestResult ? getModeDetails(latestResult.mode).title : "—";

    renderProfileHistory();
  }

  function renderProfileHistory() {
    elements.profileHistoryList.innerHTML = "";

    if (!state.history.length) {
      const empty = document.createElement("article");
      empty.className = "history-item";
      empty.innerHTML = `<p>${uiData.emptyStates.history}</p>`;
      elements.profileHistoryList.appendChild(empty);
      return;
    }

    state.history.slice(0, 5).forEach((entry) => {
      const historyCard = document.createElement("article");
      historyCard.className = "history-item";
      historyCard.innerHTML = `
        <div class="history-top">
          <strong>${entry.type} — ${entry.typeProfile.name}</strong>
          <span class="history-meta">${formatDate(entry.createdAt)}</span>
        </div>
        <div class="history-body">
          <img class="history-avatar" src="${entry.mainCharacter?.iconUrl || getFallbackAvatar("MB")}" alt="${entry.mainCharacter?.name || "Персонаж"}">
          <div>
            <h3>${entry.mainCharacter?.name || "Аниме-архетип"}</h3>
            <p>${getModeDetails(entry.mode).title} режим</p>
            <p>${entry.summaryText}</p>
          </div>
        </div>
      `;
      elements.profileHistoryList.appendChild(historyCard);
    });
  }

  function goToTestHub() {
    state.result = null;
    state.activeView = "test";
    state.selectedMode = state.latestResult?.mode || state.resumeSession?.mode || state.selectedMode;
    showScreen("hub-screen");
    renderApp();
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
      const shouldReplace = window.confirm("У тебя уже есть незавершённая сессия. Начать новый тест и заменить сохранённый прогресс?");

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

    showScreen("question-screen");
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
    showScreen("question-screen");
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
      state.activeView = "test";
      showScreen("hub-screen");
      renderApp();
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
    const normalized = normalizeResult(payload, state.mode);

    state.result = normalized;
    state.latestResult = normalized;
    state.history = [normalized, ...state.history.filter((entry) => entry.sessionId !== normalized.sessionId)];
    state.resumeSession = null;
    state.session = null;
    state.selectedTypeCode = normalized.type;
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
    const typeProfile = getTypeProfile(type);

    return {
      type,
      typeProfile,
      mode: state.mode,
      createdAt: new Date().toISOString(),
      sessionId: state.session.id,
      summaryText: `Твой тип — ${type}. ${typeProfile.description}`,
      scales,
      mainCharacter: characterPackage.main || getCharacterGroup(type)?.main || null,
      similarCharacters: characterPackage.others || getCharacterGroup(type)?.others || []
    };
  }

  function normalizeResult(payload, fallbackMode = null) {
    if (!payload) {
      return null;
    }

    const type = payload.mbtiType || payload.type;
    if (!type) {
      return null;
    }

    const typeProfile = payload.typeProfile || payload.profile || getTypeProfile(type);
    const characterGroup = getCharacterGroup(type);
    const scales = payload.scales || payload.calculation?.scales || buildScalesFromPercentages(payload.percentages);

    return {
      id: payload.id || null,
      sessionId: payload.sessionId || payload.session?.id || null,
      type,
      typeProfile,
      mode: payload.mode || fallbackMode || payload.session?.mode || "quick",
      summaryText: payload.summaryText || payload.calculation?.summaryText || `Твой тип — ${type}. ${typeProfile.description}`,
      scales,
      mainCharacter: payload.mainCharacter || characterGroup?.main || null,
      similarCharacters: payload.similarCharacters || payload.others || characterGroup?.others || [],
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

    elements.modeBadge.textContent = getModeDetails(state.mode).title;
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
    const modeLabel = getModeDetails(result.mode).title;
    const mainCharacter = result.mainCharacter || {
      name: "Аниме-архетип",
      anime: "Anime MBTI",
      description: "Описание персонажа появится после полной синхронизации.",
      imageUrl: "https://placehold.co/720x880/0e162d/f4f7ff?text=Anime+MBTI",
      traits: ["Ожидание", "Синхронизация", "Результат"]
    };

    elements.resultType.textContent = result.type;
    elements.resultTypeName.textContent = result.typeProfile.name;
    elements.resultTypeDescription.textContent = result.typeProfile.description;
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

    characters.slice(0, 3).forEach((character) => {
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

  async function handleShare() {
    if (!state.result) {
      return;
    }

    const shareText = `Я прошёл Anime MBTI Test! Мой тип — ${state.result.type}, а мой персонаж — ${state.result.mainCharacter?.name || "неизвестно кто"}.`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://t.me")}&text=${encodeURIComponent(shareText)}`;

    try {
      if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "Anime MBTI",
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

  function renderSyncChip() {
    if (!elements.syncChip) {
      return;
    }

    if (!state.session && !state.resumeSession) {
      elements.syncChip.textContent = navigator.onLine ? "Онлайн режим" : "Оффлайн режим";
      return;
    }

    const session = state.session || state.resumeSession;
    elements.syncChip.textContent = session?.synced === false
      ? "Оффлайн: ждём синхронизацию"
      : "Прогресс сохранён";
  }

  function getModeDetails(modeKey = state.selectedMode) {
    return questionData.modeOptions.find((mode) => mode.key === modeKey) || questionData.modeOptions[1];
  }

  function getTypeProfile(typeCode) {
    return characterData.typeProfiles[typeCode] || characterData.typeProfiles.INTJ;
  }

  function getCharacterGroup(typeCode) {
    return characterData.groups[typeCode] || null;
  }

  function getUserDisplayName() {
    const lastName = state.user.lastName ? ` ${state.user.lastName}` : "";
    return state.user.firstName ? `${state.user.firstName}${lastName}` : "Пользователь Telegram";
  }

  function getUserAvatar() {
    if (state.user.photoUrl) {
      return state.user.photoUrl;
    }

    return getFallbackAvatar(getUserInitials());
  }

  function getFallbackAvatar(text) {
    return `https://placehold.co/160x160/141d37/f4f6ff?text=${encodeURIComponent(text)}`;
  }

  function getUserInitials() {
    const source = `${state.user.firstName || ""} ${state.user.lastName || ""}`.trim() || "A";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function setNetworkStatus() {
    elements.networkStatus.textContent = navigator.onLine ? "Онлайн" : "Оффлайн";
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
