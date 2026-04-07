const { getQuestionBundle } = require("../services/questionsService");
const { sendError } = require("./http");

function getByMode(req, res) {
  try {
    res.json(getQuestionBundle(req.params.mode));
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  getByMode
};
