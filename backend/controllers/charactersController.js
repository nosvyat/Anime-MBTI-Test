const { getCharacterPackageByType } = require("../services/charactersService");
const { sendError } = require("./http");

async function getByType(req, res) {
  try {
    res.json(await getCharacterPackageByType(req.params.mbtiType));
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  getByType
};
