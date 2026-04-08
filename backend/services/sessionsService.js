const { get, run, withTransaction } = require("../db/database");
const { HttpError } = require("../controllers/http");
const { normalizeMode } = require("./catalogService");
const { ensureUserByTelegram } = require("./usersService");
const { getQuestionBundle } = require("./questionsService");
const { getCharacterPackageByType } = require("./charactersService");
const { calculateMbtiResult } = require("./mbtiService");
const { createResult } = require("./resultsService");

function parseAnswers(jsonValue, totalQuestions) {
  const parsed = Array.isArray(jsonValue) ? jsonValue : JSON.parse(jsonValue || "[]");
  return Array.from({ length: totalQuestions }, (_, index) => {
    const value = parsed[index];
    return typeof value === "number" ? value : null;
  });
}

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapSession(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    mode: row.mode,
    status: row.status,
    currentQuestionIndex: row.current_question_index,
    totalQuestions: row.total_questions,
    answers: parseAnswers(row.answers_json, row.total_questions),
    startedAt: serializeDate(row.started_at),
    updatedAt: serializeDate(row.updated_at),
    completedAt: serializeDate(row.completed_at)
  };
}

async function getSessionRowById(id) {
  return get("SELECT * FROM test_sessions WHERE id = ?", [Number(id)]);
}

function assertInProgressSession(sessionRow) {
  if (!sessionRow) {
    throw new HttpError(404, "Session not found");
  }

  if (sessionRow.status !== "in_progress") {
    throw new HttpError(409, "Session is already completed");
  }
}

async function getActiveSessionByTelegramId(telegramId) {
  const row = await get(`
    SELECT ts.*
    FROM test_sessions ts
    INNER JOIN users u ON u.id = ts.user_id
    WHERE u.telegram_id = ? AND ts.status = 'in_progress'
    ORDER BY ts.updated_at DESC, ts.id DESC
    LIMIT 1
  `, [String(telegramId)]);

  return mapSession(row);
}

async function startSession(payload) {
  const mode = normalizeMode(payload.mode);
  const user = await ensureUserByTelegram({
    telegramId: payload.telegramId,
    username: payload.username,
    firstName: payload.firstName,
    lastName: payload.lastName
  });
  const questionBundle = await getQuestionBundle(mode);

  return withTransaction(async () => {
    await run("DELETE FROM test_sessions WHERE user_id = ? AND status = 'in_progress'", [user.id]);

    const row = await get(`
      INSERT INTO test_sessions (
        user_id, mode, status, current_question_index, total_questions, answers_json,
        started_at, updated_at
      )
      VALUES (?, ?, 'in_progress', 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      user.id,
      mode,
      questionBundle.totalQuestions,
      JSON.stringify(Array(questionBundle.totalQuestions).fill(null))
    ]);

    return mapSession(row);
  });
}

async function saveAnswer(sessionId, questionIndex, value) {
  const sessionRow = await getSessionRowById(sessionId);
  assertInProgressSession(sessionRow);

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < -3 || numericValue > 3) {
    throw new HttpError(400, "Answer value must be an integer between -3 and 3");
  }

  if (questionIndex < 0 || questionIndex >= sessionRow.total_questions) {
    throw new HttpError(400, "questionIndex is out of range");
  }

  const answers = parseAnswers(sessionRow.answers_json, sessionRow.total_questions);
  answers[questionIndex] = numericValue;

  const updated = await get(`
    UPDATE test_sessions
    SET answers_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `, [JSON.stringify(answers), Number(sessionId)]);

  return mapSession(updated);
}

async function updateProgress(sessionId, payload) {
  const sessionRow = await getSessionRowById(sessionId);
  assertInProgressSession(sessionRow);

  const answers = Array.isArray(payload.answers)
    ? Array.from({ length: sessionRow.total_questions }, (_, index) => {
        const value = payload.answers[index];
        return typeof value === "number" ? value : null;
      })
    : parseAnswers(sessionRow.answers_json, sessionRow.total_questions);

  const currentQuestionIndex = Math.max(
    0,
    Math.min(Number(payload.currentQuestionIndex ?? sessionRow.current_question_index), sessionRow.total_questions - 1)
  );

  const updated = await get(`
    UPDATE test_sessions
    SET current_question_index = ?, answers_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `, [currentQuestionIndex, JSON.stringify(answers), Number(sessionId)]);

  return mapSession(updated);
}

async function completeSession(sessionId) {
  const sessionRow = await getSessionRowById(sessionId);
  assertInProgressSession(sessionRow);

  const session = mapSession(sessionRow);
  const bundle = await getQuestionBundle(session.mode);
  const unansweredIndex = session.answers.findIndex((answer) => typeof answer !== "number");

  if (unansweredIndex !== -1) {
    throw new HttpError(400, "All questions must be answered before completion", {
      unansweredIndex
    });
  }

  const calculation = calculateMbtiResult(bundle.questions, session.answers);
  const characterPackage = await getCharacterPackageByType(calculation.type);

  return withTransaction(async () => {
    const updatedSession = await get(`
      UPDATE test_sessions
      SET status = 'completed',
          current_question_index = ?,
          updated_at = CURRENT_TIMESTAMP,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `, [session.totalQuestions - 1, Number(sessionId)]);

    const result = await createResult({
      userId: session.userId,
      sessionId: session.id,
      mode: session.mode,
      calculation,
      characterPackage
    });

    return {
      session: mapSession(updatedSession),
      result: {
        ...result,
        calculation
      }
    };
  });
}

module.exports = {
  getActiveSessionByTelegramId,
  startSession,
  saveAnswer,
  updateProgress,
  completeSession
};
