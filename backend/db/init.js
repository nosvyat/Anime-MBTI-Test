const fs = require("node:fs");
const path = require("node:path");
const { database, get } = require("./database");
const { QUESTION_SEED, CHARACTER_SEED } = require("../services/catalogService");

const schemaPath = path.join(__dirname, "..", "schema.sql");

function tableCount(tableName) {
  const row = get(`SELECT COUNT(*) AS count FROM ${tableName}`);
  return row ? row.count : 0;
}

function seedQuestions() {
  if (tableCount("questions") > 0) {
    return;
  }

  const insert = database.prepare(`
    INSERT INTO questions (text, scale_type, direct_side, mode_min, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  QUESTION_SEED.forEach((question) => {
    insert.run(question.text, question.scaleType, question.directSide, question.modeMin);
  });
}

function seedCharacters() {
  if (tableCount("characters") > 0) {
    return;
  }

  const insert = database.prepare(`
    INSERT INTO characters (
      code, name, anime, mbti_type, role_type, icon_url, image_url,
      description, traits_json, priority, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  CHARACTER_SEED.forEach((character) => {
    insert.run(
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
    );
  });
}

function initializeDatabase() {
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  database.exec(schemaSql);
  seedQuestions();
  seedCharacters();
}

module.exports = {
  initializeDatabase
};
