const fs = require("node:fs");
const path = require("node:path");
const { AsyncLocalStorage } = require("node:async_hooks");
const { DatabaseSync } = require("node:sqlite");

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const dialect = hasDatabaseUrl ? "postgres" : "sqlite";
const transactionScope = new AsyncLocalStorage();

let sqliteDatabase = null;
let pgPool = null;
let sqlitePath = null;

if (dialect === "sqlite") {
  sqlitePath = process.env.DB_PATH || path.join(__dirname, "anime-mbti.sqlite");
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  sqliteDatabase = new DatabaseSync(sqlitePath);
  sqliteDatabase.exec("PRAGMA foreign_keys = ON;");
} else {
  const { Pool } = require("pg");
  const sslMode = String(process.env.PGSSL || process.env.DATABASE_SSL || "").toLowerCase();

  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL_MAX || 10),
    ssl: sslMode === "true" || sslMode === "require"
      ? { rejectUnauthorized: false }
      : undefined
  });
}

function normalizeParams(params) {
  if (params === undefined) {
    return [];
  }

  return Array.isArray(params) ? params : [params];
}

function translateSql(sql) {
  if (dialect !== "postgres") {
    return sql;
  }

  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

function splitSqlStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function getPgExecutor() {
  return transactionScope.getStore() || pgPool;
}

async function exec(sql) {
  if (dialect === "sqlite") {
    sqliteDatabase.exec(sql);
    return;
  }

  const executor = getPgExecutor();
  const statements = splitSqlStatements(sql);

  for (const statement of statements) {
    await executor.query(statement);
  }
}

async function run(sql, params) {
  const normalizedParams = normalizeParams(params);

  if (dialect === "sqlite") {
    return sqliteDatabase.prepare(sql).run(...normalizedParams);
  }

  const result = await getPgExecutor().query(translateSql(sql), normalizedParams);
  return {
    changes: result.rowCount,
    rowCount: result.rowCount,
    rows: result.rows
  };
}

async function get(sql, params) {
  const normalizedParams = normalizeParams(params);

  if (dialect === "sqlite") {
    return sqliteDatabase.prepare(sql).get(...normalizedParams) || null;
  }

  const result = await getPgExecutor().query(translateSql(sql), normalizedParams);
  return result.rows[0] || null;
}

async function all(sql, params) {
  const normalizedParams = normalizeParams(params);

  if (dialect === "sqlite") {
    return sqliteDatabase.prepare(sql).all(...normalizedParams);
  }

  const result = await getPgExecutor().query(translateSql(sql), normalizedParams);
  return result.rows;
}

async function withTransaction(work) {
  if (dialect === "sqlite") {
    sqliteDatabase.exec("BEGIN");

    try {
      const result = await work();
      sqliteDatabase.exec("COMMIT");
      return result;
    } catch (error) {
      sqliteDatabase.exec("ROLLBACK");
      throw error;
    }
  }

  const client = await pgPool.connect();

  try {
    await client.query("BEGIN");
    const result = await transactionScope.run(client, async () => work());
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function closeDatabase() {
  if (sqliteDatabase) {
    sqliteDatabase.close();
    return;
  }

  if (pgPool) {
    await pgPool.end();
  }
}

module.exports = {
  dialect,
  dbPath: sqlitePath,
  exec,
  run,
  get,
  all,
  withTransaction,
  closeDatabase
};
