const { all } = require("../db/database");
const { MODE_DETAILS, normalizeMode, canModeUseQuestion } = require("./catalogService");

function mapQuestion(row) {
  return {
    id: row.id,
    text: row.text,
    scaleType: row.scale_type,
    directSide: row.direct_side,
    modeMin: row.mode_min,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getAllQuestions() {
  return all("SELECT * FROM questions WHERE active = 1 ORDER BY id ASC").map(mapQuestion);
}

function getQuestionsByMode(mode) {
  const normalizedMode = normalizeMode(mode);
  return getAllQuestions().filter((question) => canModeUseQuestion(normalizedMode, question.modeMin));
}

function getQuestionBundle(mode) {
  const normalizedMode = normalizeMode(mode);
  const questions = getQuestionsByMode(normalizedMode);

  return {
    mode: normalizedMode,
    totalQuestions: questions.length,
    modeDetails: MODE_DETAILS[normalizedMode],
    questions
  };
}

module.exports = {
  getQuestionBundle,
  getQuestionsByMode
};
