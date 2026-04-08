const { all, get } = require("../db/database");
const { getTypeProfile, normalizeTypeCode } = require("./catalogService");

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapCharacter(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    anime: row.anime,
    mbtiType: row.mbti_type,
    roleType: row.role_type,
    iconUrl: row.icon_url,
    imageUrl: row.image_url,
    description: row.description,
    traits: parseJsonArray(row.traits_json),
    priority: row.priority,
    createdAt: serializeDate(row.created_at),
    updatedAt: serializeDate(row.updated_at)
  };
}

async function getCharacterById(id) {
  return mapCharacter(await get("SELECT * FROM characters WHERE id = ?", [id]));
}

async function getCharactersByType(mbtiType) {
  const baseType = normalizeTypeCode(mbtiType);

  const rows = await all(`
    SELECT * FROM characters
    WHERE mbti_type = ?
    ORDER BY CASE role_type WHEN 'main' THEN 0 ELSE 1 END ASC, priority ASC, id ASC
  `, [baseType]);

  return rows.map(mapCharacter);
}

async function getCharacterPackageByType(mbtiType) {
  const requestedType = String(mbtiType || "").toUpperCase();
  const baseType = normalizeTypeCode(requestedType);
  const characters = await getCharactersByType(baseType);
  const main = characters.find((character) => character.roleType === "main") || characters[0] || null;
  const others = characters.filter((character) => character.roleType !== "main").slice(0, 3);

  return {
    mbtiType: requestedType,
    baseMbtiType: baseType,
    typeProfile: getTypeProfile(requestedType),
    main,
    others
  };
}

module.exports = {
  getCharacterById,
  getCharactersByType,
  getCharacterPackageByType
};
