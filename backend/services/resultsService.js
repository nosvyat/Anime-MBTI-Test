const { get, all } = require("../db/database");
const { getCharacterById } = require("./charactersService");
const { getTypeProfile } = require("./catalogService");

function mapResultRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    mbtiType: row.mbti_type,
    percentages: {
      EI: row.ei_percent,
      NS: row.ns_percent,
      TF: row.tf_percent,
      JP: row.jp_percent
    },
    mainCharacterId: row.main_character_id,
    similarCharacterIds: JSON.parse(row.similar_characters_json || "[]"),
    summaryText: row.summary_text,
    createdAt: row.created_at
  };
}

function enrichResult(result, mode = null) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    mode,
    typeProfile: getTypeProfile(result.mbtiType),
    mainCharacter: result.mainCharacterId ? getCharacterById(result.mainCharacterId) : null,
    similarCharacters: result.similarCharacterIds.map((id) => getCharacterById(id)).filter(Boolean)
  };
}

function createResult({ userId, sessionId, mode, calculation, characterPackage }) {
  const row = get(`
    INSERT INTO test_results (
      user_id, session_id, mbti_type, ei_percent, ns_percent, tf_percent, jp_percent,
      main_character_id, similar_characters_json, summary_text, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    RETURNING *
  `, [
    userId,
    sessionId,
    calculation.type,
    calculation.percentages.EI.E,
    calculation.percentages.NS.N,
    calculation.percentages.TF.T,
    calculation.percentages.JP.J,
    characterPackage.main ? characterPackage.main.id : null,
    JSON.stringify(characterPackage.others.map((character) => character.id)),
    calculation.summaryText
  ]);

  return enrichResult(mapResultRow(row), mode);
}

function getLatestResultByTelegramId(telegramId) {
  const row = get(`
    SELECT tr.*, ts.mode
    FROM test_results tr
    INNER JOIN users u ON u.id = tr.user_id
    INNER JOIN test_sessions ts ON ts.id = tr.session_id
    WHERE u.telegram_id = ?
    ORDER BY tr.created_at DESC, tr.id DESC
    LIMIT 1
  `, [String(telegramId)]);

  return row ? enrichResult(mapResultRow(row), row.mode) : null;
}

function getHistoryByTelegramId(telegramId) {
  const rows = all(`
    SELECT tr.*, ts.mode
    FROM test_results tr
    INNER JOIN users u ON u.id = tr.user_id
    INNER JOIN test_sessions ts ON ts.id = tr.session_id
    WHERE u.telegram_id = ?
    ORDER BY tr.created_at DESC, tr.id DESC
  `, [String(telegramId)]);

  return rows.map((row) => enrichResult(mapResultRow(row), row.mode));
}

module.exports = {
  createResult,
  getLatestResultByTelegramId,
  getHistoryByTelegramId
};
