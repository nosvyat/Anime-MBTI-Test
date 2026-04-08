const {
  getActiveSessionByTelegramId,
  startSession,
  saveAnswer,
  updateProgress,
  completeSession
} = require("../services/sessionsService");
const { HttpError, sendError } = require("./http");

async function getActiveSession(req, res) {
  try {
    const session = await getActiveSessionByTelegramId(req.params.telegramId);
    res.json({ session });
  } catch (error) {
    sendError(res, error);
  }
}

async function postStartSession(req, res) {
  try {
    const session = await startSession(req.body || {});
    res.status(201).json({ session });
  } catch (error) {
    sendError(res, error);
  }
}

async function postAnswer(req, res) {
  try {
    const sessionId = Number(req.params.id);
    const questionIndex = Number(req.body?.questionIndex);
    const value = Number(req.body?.value);
    const session = await saveAnswer(sessionId, questionIndex, value);
    res.json({ session });
  } catch (error) {
    sendError(res, error);
  }
}

async function postProgress(req, res) {
  try {
    const sessionId = Number(req.params.id);
    if (!sessionId) {
      throw new HttpError(400, "Valid session id is required");
    }

    const session = await updateProgress(sessionId, req.body || {});
    res.json({ session });
  } catch (error) {
    sendError(res, error);
  }
}

async function postComplete(req, res) {
  try {
    const sessionId = Number(req.params.id);
    res.json(await completeSession(sessionId));
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  getActiveSession,
  postStartSession,
  postAnswer,
  postProgress,
  postComplete
};
