window.AnimeMbtiApi = (() => {
  const CACHE_KEY = "anime-mbti-phase2-cache-v1";

  function getDefaultCache() {
    return {
      user: null,
      activeSession: null,
      latestResult: null,
      history: [],
      questionsByMode: {},
      pendingSessionSync: null
    };
  }

  function loadCache() {
    try {
      return {
        ...getDefaultCache(),
        ...JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
      };
    } catch (error) {
      return getDefaultCache();
    }
  }

  function saveCache(cache) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return cache;
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Request failed with status ${response.status}`);
      error.details = data.details || null;
      throw error;
    }

    return data;
  }

  function getFallbackQuestions(mode) {
    const source = window.APP_QUESTION_DATA;
    return source.getQuestionsByMode(mode).map((question, index) => ({
      id: index + 1,
      ...question
    }));
  }

  function getFallbackCharacters(mbtiType) {
    const data = window.APP_CHARACTER_DATA;
    const requestedType = String(mbtiType || "").toUpperCase();
    const baseType = data.normalizeTypeCode ? data.normalizeTypeCode(requestedType) : requestedType;
    const group = data.groups[baseType];
    const typeDetails = data.typeDetails[requestedType] || data.typeDetails[baseType] || {};

    return {
      mbtiType: requestedType,
      baseMbtiType: baseType,
      typeProfile: {
        code: requestedType,
        ...typeDetails
      },
      main: group ? { id: `${baseType}-main`, ...group.main, mbtiType: requestedType, roleType: "main" } : null,
      others: group
        ? group.others.map((character, index) => ({
            id: `${baseType}-support-${index + 1}`,
            ...character,
            mbtiType: requestedType,
            roleType: "support"
          }))
        : []
    };
  }

  function writeSessionToCache(session) {
    const cache = loadCache();
    cache.activeSession = session && session.status === "in_progress" ? session : null;
    cache.pendingSessionSync = session && session.synced === false ? session : cache.pendingSessionSync;
    saveCache(cache);
    return session;
  }

  async function upsertUser(user) {
    const cache = loadCache();

    try {
      const data = await request("/api/users/upsert", {
        method: "POST",
        body: JSON.stringify(user)
      });
      cache.user = data.user;
      saveCache(cache);
      return data.user;
    } catch (error) {
      cache.user = user;
      saveCache(cache);
      return user;
    }
  }

  async function getActiveSession(telegramId) {
    const cache = loadCache();

    try {
      const data = await request(`/api/sessions/active/${encodeURIComponent(telegramId)}`);
      cache.activeSession = data.session;
      saveCache(cache);
      return data.session;
    } catch (error) {
      return cache.activeSession;
    }
  }

  async function getQuestions(mode) {
    const cache = loadCache();

    try {
      const bundle = await request(`/api/questions/${encodeURIComponent(mode)}`);
      cache.questionsByMode[mode] = bundle;
      saveCache(cache);
      return bundle;
    } catch (error) {
      const fallback = {
        mode,
        totalQuestions: getFallbackQuestions(mode).length,
        modeDetails: window.APP_QUESTION_DATA.modeOptions.find((item) => item.key === mode),
        questions: getFallbackQuestions(mode)
      };
      cache.questionsByMode[mode] = fallback;
      saveCache(cache);
      return fallback;
    }
  }

  async function startSession(payload) {
    const bundle = await getQuestions(payload.mode);
    const cache = loadCache();

    try {
      const data = await request("/api/sessions/start", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const session = { ...data.session, synced: true };
      cache.activeSession = session;
      cache.pendingSessionSync = null;
      saveCache(cache);
      return session;
    } catch (error) {
      const localSession = {
        id: `local-${Date.now()}`,
        userId: null,
        mode: payload.mode,
        status: "in_progress",
        currentQuestionIndex: 0,
        totalQuestions: bundle.totalQuestions,
        answers: Array(bundle.totalQuestions).fill(null),
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        synced: false
      };
      cache.activeSession = localSession;
      cache.pendingSessionSync = localSession;
      saveCache(cache);
      return localSession;
    }
  }

  async function saveAnswer(session, questionIndex, value) {
    const snapshot = {
      ...session,
      answers: session.answers.map((answer, index) => (index === questionIndex ? value : answer)),
      updatedAt: new Date().toISOString()
    };

    const cache = loadCache();

    if (String(session.id).startsWith("local-")) {
      snapshot.synced = false;
      cache.activeSession = snapshot;
      cache.pendingSessionSync = snapshot;
      saveCache(cache);
      return snapshot;
    }

    try {
      const data = await request(`/api/sessions/${session.id}/answer`, {
        method: "POST",
        body: JSON.stringify({
          questionIndex,
          value
        })
      });
      const nextSession = { ...data.session, synced: true };
      cache.activeSession = nextSession;
      saveCache(cache);
      return nextSession;
    } catch (error) {
      snapshot.synced = false;
      cache.activeSession = snapshot;
      cache.pendingSessionSync = snapshot;
      saveCache(cache);
      return snapshot;
    }
  }

  async function updateProgress(session, currentQuestionIndex) {
    const snapshot = {
      ...session,
      currentQuestionIndex,
      updatedAt: new Date().toISOString()
    };

    const cache = loadCache();

    if (String(session.id).startsWith("local-")) {
      snapshot.synced = false;
      cache.activeSession = snapshot;
      cache.pendingSessionSync = snapshot;
      saveCache(cache);
      return snapshot;
    }

    try {
      const data = await request(`/api/sessions/${session.id}/progress`, {
        method: "POST",
        body: JSON.stringify({
          currentQuestionIndex,
          answers: session.answers
        })
      });
      const nextSession = { ...data.session, synced: true };
      cache.activeSession = nextSession;
      cache.pendingSessionSync = null;
      saveCache(cache);
      return nextSession;
    } catch (error) {
      snapshot.synced = false;
      cache.activeSession = snapshot;
      cache.pendingSessionSync = snapshot;
      saveCache(cache);
      return snapshot;
    }
  }

  function cacheCompletedResult(result, completedSession) {
    const cache = loadCache();
    cache.latestResult = result;
    cache.activeSession = null;
    cache.pendingSessionSync = completedSession && completedSession.synced === false ? completedSession : null;

    if (result) {
      cache.history = [result, ...cache.history.filter((entry) => entry.sessionId !== result.sessionId)];
    }

    saveCache(cache);
    return result;
  }

  async function completeSession(session, provisionalResult) {
    const cache = loadCache();
    const completedSnapshot = {
      ...session,
      status: "completed",
      completedAt: new Date().toISOString(),
      synced: false
    };

    if (String(session.id).startsWith("local-")) {
      cache.activeSession = null;
      cache.pendingSessionSync = completedSnapshot;
      saveCache(cache);
      return cacheCompletedResult(provisionalResult, completedSnapshot);
    }

    try {
      const data = await request(`/api/sessions/${session.id}/complete`, {
        method: "POST"
      });
      return cacheCompletedResult(data.result, { ...data.session, synced: true });
    } catch (error) {
      cache.activeSession = null;
      cache.pendingSessionSync = completedSnapshot;
      saveCache(cache);
      return cacheCompletedResult(provisionalResult, completedSnapshot);
    }
  }

  async function getLatestResult(telegramId) {
    const cache = loadCache();

    try {
      const data = await request(`/api/results/latest/${encodeURIComponent(telegramId)}`);
      cache.latestResult = data.result;
      saveCache(cache);
      return data.result;
    } catch (error) {
      return cache.latestResult;
    }
  }

  async function getHistory(telegramId) {
    const cache = loadCache();

    try {
      const data = await request(`/api/results/history/${encodeURIComponent(telegramId)}`);
      cache.history = data.history;
      saveCache(cache);
      return data.history;
    } catch (error) {
      return cache.history || [];
    }
  }

  async function getCharactersByType(mbtiType) {
    try {
      return await request(`/api/characters/by-type/${encodeURIComponent(mbtiType)}`);
    } catch (error) {
      return getFallbackCharacters(mbtiType);
    }
  }

  async function syncPendingSession(user) {
    const cache = loadCache();
    const snapshot = cache.pendingSessionSync;

    if (!snapshot || !navigator.onLine) {
      return null;
    }

    const payload = {
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      mode: snapshot.mode
    };

    try {
      let session = snapshot;

      if (String(snapshot.id).startsWith("local-")) {
        const started = await request("/api/sessions/start", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        session = { ...started.session, answers: snapshot.answers };
      }

      if (Array.isArray(snapshot.answers)) {
        const progress = await request(`/api/sessions/${session.id}/progress`, {
          method: "POST",
          body: JSON.stringify({
            currentQuestionIndex: snapshot.currentQuestionIndex || 0,
            answers: snapshot.answers
          })
        });
        session = progress.session;
      }

      if (snapshot.status === "completed") {
        const completed = await request(`/api/sessions/${session.id}/complete`, {
          method: "POST"
        });
        cache.pendingSessionSync = null;
        cache.activeSession = null;
        cache.latestResult = completed.result;
        cache.history = [completed.result, ...cache.history.filter((entry) => entry.sessionId !== completed.result.sessionId)];
        saveCache(cache);
        return completed.result;
      }

      cache.pendingSessionSync = null;
      cache.activeSession = { ...session, synced: true };
      saveCache(cache);
      return session;
    } catch (error) {
      return null;
    }
  }

  function getCachedState() {
    return loadCache();
  }

  return {
    upsertUser,
    getActiveSession,
    getQuestions,
    startSession,
    saveAnswer,
    updateProgress,
    completeSession,
    getLatestResult,
    getHistory,
    getCharactersByType,
    syncPendingSession,
    getCachedState,
    writeSessionToCache
  };
})();
