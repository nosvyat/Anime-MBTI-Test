const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = process.env.DB_PATH || path.join(__dirname, "anime-mbti.sqlite");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const database = new DatabaseSync(dbPath);
database.exec("PRAGMA foreign_keys = ON;");

function normalizeParams(params) {
  if (params === undefined) {
    return [];
  }

  if (Array.isArray(params)) {
    return params;
  }

  return [params];
}

function run(sql, params) {
  return database.prepare(sql).run(...normalizeParams(params));
}

function get(sql, params) {
  return database.prepare(sql).get(...normalizeParams(params));
}

function all(sql, params) {
  return database.prepare(sql).all(...normalizeParams(params));
}

function withTransaction(work) {
  database.exec("BEGIN");

  try {
    const result = work();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

module.exports = {
  database,
  dbPath,
  run,
  get,
  all,
  withTransaction
};
