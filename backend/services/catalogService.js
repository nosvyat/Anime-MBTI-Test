const MBTI_PROFILES = require("./typeProfiles");
const QUESTION_SEED = require("./questionSeed");
const { CHARACTER_GROUPS, CHARACTER_SEED } = require("./characterSeed");
const { HttpError } = require("../controllers/http");

const MODE_ORDER = Object.freeze({
  quick: 1,
  medium: 2,
  full: 3
});

const SCALE_SIDES = Object.freeze({
  EI: ["E", "I"],
  NS: ["N", "S"],
  TF: ["T", "F"],
  JP: ["J", "P"]
});

const MODE_DETAILS = Object.freeze({
  quick: {
    key: "quick",
    title: "Quick",
    subtitle: "Быстрый режим",
    questionCount: 24,
    description: "Короткий и динамичный прогон на 24 вопроса."
  },
  medium: {
    key: "medium",
    title: "Medium",
    subtitle: "Средний режим",
    questionCount: 40,
    description: "Больше нюансов и чуть глубже профиль личности."
  },
  full: {
    key: "full",
    title: "Full",
    subtitle: "Полный режим",
    questionCount: 60,
    description: "Максимально подробный разбор по всем шкалам."
  }
});

function normalizeMode(mode) {
  if (!MODE_ORDER[mode]) {
    throw new HttpError(400, `Unsupported mode: ${mode}`);
  }

  return mode;
}

function canModeUseQuestion(targetMode, questionModeMin) {
  return MODE_ORDER[targetMode] >= MODE_ORDER[questionModeMin];
}

function getTypeProfile(type) {
  return MBTI_PROFILES[type] || {
    code: type,
    name: type,
    description: "Сбалансированный профиль личности с уникальной смесью логики, энергии и стиля принятия решений."
  };
}

module.exports = {
  MODE_ORDER,
  MODE_DETAILS,
  SCALE_SIDES,
  MBTI_PROFILES,
  QUESTION_SEED,
  CHARACTER_GROUPS,
  CHARACTER_SEED,
  normalizeMode,
  canModeUseQuestion,
  getTypeProfile
};
