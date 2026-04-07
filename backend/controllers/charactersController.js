const { getCharacterPackageByType } = require("../services/charactersService");
const { sendError } = require("./http");

function getByType(req, res) {
  try {
    res.json(getCharacterPackageByType(req.params.mbtiType));
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  getByType
};
