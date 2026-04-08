const { all } = require("../db/database");
const { MODE_DETAILS, normalizeMode, canModeUseQuestion } = require("./catalogService");

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapQuestion(row) {
  return {
    id: row.id,
    text: row.text,
    scaleType: row.scale_type,
    directSide: row.direct_side,
    modeMin: row.mode_min,
    active: Boolean(row.active),
    createdAt: serializeDate(row.created_at),
    updatedAt: serializeDate(row.updated_at)
  };
}

async function getAllQuestions() {
  const rows = await all("SELECT * FROM questions WHERE active = 1 ORDER BY id ASC");
  return rows.map(mapQuestion);
}

async function getQuestionsByMode(mode) {
  const normalizedMode = normalizeMode(mode);
  const questions = await getAllQuestions();
  return questions.filter((question) => canModeUseQuestion(normalizedMode, question.modeMin));
}

async function getQuestionBundle(mode) {
  const normalizedMode = normalizeMode(mode);
  const questions = await getQuestionsByMode(normalizedMode);

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
