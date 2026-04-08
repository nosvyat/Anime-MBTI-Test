const { get } = require("../db/database");
const { HttpError } = require("../controllers/http");

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

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
    createdAt: serializeDate(row.created_at),
    updatedAt: serializeDate(row.updated_at)
  };
}

async function upsertUser(payload) {
  const telegramId = String(payload.telegramId || "").trim();
  const firstName = String(payload.firstName || "Local Tester").trim();
  const username = payload.username ? String(payload.username).trim() : null;
  const lastName = payload.lastName ? String(payload.lastName).trim() : null;

  if (!telegramId) {
    throw new HttpError(400, "telegramId is required");
  }

  const row = await get(`
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

async function getUserByTelegramId(telegramId) {
  return mapUser(await get("SELECT * FROM users WHERE telegram_id = ?", [String(telegramId)]));
}

async function ensureUserByTelegram(payload) {
  const existing = await getUserByTelegramId(payload.telegramId);
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
