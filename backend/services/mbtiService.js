const { SCALE_SIDES, getTypeProfile } = require("./catalogService");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calculateMbtiResult(questions, answers) {
  const totals = { EI: 0, NS: 0, TF: 0, JP: 0 };
  const counts = { EI: 0, NS: 0, TF: 0, JP: 0 };

  questions.forEach((question, index) => {
    const value = Number(answers[index] ?? 0);
    const [leftSide] = SCALE_SIDES[question.scaleType];
    const normalized = question.directSide === leftSide ? value : value * -1;

    totals[question.scaleType] += normalized;
    counts[question.scaleType] += 1;
  });

  const percentages = {};
  const dominantSides = {};
  const rawScores = {};
  const scales = [];

  Object.entries(SCALE_SIDES).forEach(([scaleType, [leftSide, rightSide]]) => {
    const score = totals[scaleType];
    const maxAbs = Math.max(counts[scaleType] * 3, 1);
    const leftPercent = clamp(Math.round(((score + maxAbs) / (maxAbs * 2)) * 100), 0, 100);
    const rightPercent = 100 - leftPercent;
    const dominantSide = score >= 0 ? leftSide : rightSide;

    percentages[scaleType] = {
      [leftSide]: leftPercent,
      [rightSide]: rightPercent
    };
    dominantSides[scaleType] = dominantSide;
    rawScores[scaleType] = score;
    scales.push({
      scaleType,
      leftSide,
      rightSide,
      leftPercent,
      rightPercent,
      dominantSide,
      rawScore: score
    });
  });

  const type = [dominantSides.EI, dominantSides.NS, dominantSides.TF, dominantSides.JP].join("");
  const profile = getTypeProfile(type);

  return {
    type,
    profile,
    percentages,
    dominantSides,
    rawScores,
    scales,
    summaryText: `${type} — ${profile.name}. ${profile.description}`
  };
}

module.exports = {
  calculateMbtiResult
};
