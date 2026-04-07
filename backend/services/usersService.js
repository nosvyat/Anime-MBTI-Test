const { get } = require("../db/database");
const { HttpError } = require("../controllers/http");

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    telegramId: row.telegram_id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function upsertUser(payload) {
  const telegramId = String(payload.telegramId || "").trim();
  const firstName = String(payload.firstName || "Local Tester").trim();
  const username = payload.username ? String(payload.username).trim() : null;
  const lastName = payload.lastName ? String(payload.lastName).trim() : null;

  if (!telegramId) {
    throw new HttpError(400, "telegramId is required");
  }

  const row = get(`
    INSERT INTO users (telegram_id, username, first_name, last_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(telegram_id) DO UPDATE SET
      username = excluded.username,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `, [telegramId, username, firstName, lastName]);

  return mapUser(row);
}

function getUserByTelegramId(telegramId) {
  return mapUser(get("SELECT * FROM users WHERE telegram_id = ?", [String(telegramId)]));
}

function ensureUserByTelegram(payload) {
  const existing = getUserByTelegramId(payload.telegramId);
  if (existing) {
    return upsertUser({
      telegramId: payload.telegramId,
      username: payload.username ?? existing.username,
      firstName: payload.firstName ?? existing.firstName,
      lastName: payload.lastName ?? existing.lastName
    });
  }

  return upsertUser(payload);
}

module.exports = {
  upsertUser,
  getUserByTelegramId,
  ensureUserByTelegram
};
