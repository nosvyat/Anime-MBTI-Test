const { all, get } = require("../db/database");
const { getTypeProfile } = require("./catalogService");

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
    traits: JSON.parse(row.traits_json || "[]"),
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getCharacterById(id) {
  return mapCharacter(get("SELECT * FROM characters WHERE id = ?", [id]));
}

function getCharactersByType(mbtiType) {
  return all(`
    SELECT * FROM characters
    WHERE mbti_type = ?
    ORDER BY CASE role_type WHEN 'main' THEN 0 ELSE 1 END ASC, priority ASC, id ASC
  `, [String(mbtiType).toUpperCase()]).map(mapCharacter);
}

function getCharacterPackageByType(mbtiType) {
  const characters = getCharactersByType(mbtiType);
  const main = characters.find((character) => character.roleType === "main") || characters[0] || null;
  const others = characters.filter((character) => character.roleType !== "main").slice(0, 3);

  return {
    mbtiType: String(mbtiType).toUpperCase(),
    typeProfile: getTypeProfile(String(mbtiType).toUpperCase()),
    main,
    others
  };
}

module.exports = {
  getCharacterById,
  getCharactersByType,
  getCharacterPackageByType
};
