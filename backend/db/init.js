const fs = require("node:fs");
const path = require("node:path");
const { dialect, exec, get, run } = require("./database");
const { QUESTION_SEED, CHARACTER_SEED } = require("../services/catalogService");

const sqliteSchemaPath = path.join(__dirname, "..", "schema.sql");
const postgresSchemaPath = path.join(__dirname, "..", "schema.postgres.sql");

function getSchemaPath() {
  return dialect === "postgres" ? postgresSchemaPath : sqliteSchemaPath;
}

async function tableCount(tableName) {
  const row = await get(`SELECT COUNT(*) AS count FROM ${tableName}`);
  return row ? Number(row.count || 0) : 0;
}

async function seedQuestions() {
  if (await tableCount("questions")) {
    return;
  }

  for (const question of QUESTION_SEED) {
    await run(`
      INSERT INTO questions (text, scale_type, direct_side, mode_min, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [question.text, question.scaleType, question.directSide, question.modeMin]);
  }
}

async function seedCharacters() {
  if (await tableCount("characters")) {
    return;
  }

  for (const character of CHARACTER_SEED) {
    await run(`
      INSERT INTO characters (
        code, name, anime, mbti_type, role_type, icon_url, image_url,
        description, traits_json, priority, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      character.code,
      character.name,
      character.anime,
      character.mbtiType,
      character.roleType,
      character.iconUrl,
      character.imageUrl,
      character.description,
      JSON.stringify(character.traits),
      character.priority
    ]);
  }
}

async function initializeDatabase() {
  const schemaSql = fs.readFileSync(getSchemaPath(), "utf8");
  await exec(schemaSql);
  await seedQuestions();
  await seedCharacters();
}

module.exports = {
  initializeDatabase
};
