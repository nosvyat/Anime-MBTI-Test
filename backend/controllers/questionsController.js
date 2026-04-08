const { getQuestionBundle } = require("../services/questionsService");
const { sendError } = require("./http");

async function getByMode(req, res) {
  try {
    res.json(await getQuestionBundle(req.params.mode));
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  getByMode
};
