const { getLatestResultByTelegramId, getHistoryByTelegramId } = require("../services/resultsService");
const { sendError } = require("./http");

function getLatestResult(req, res) {
  try {
    const result = getLatestResultByTelegramId(req.params.telegramId);
    res.json({ result });
  } catch (error) {
    sendError(res, error);
  }
}

function getHistory(req, res) {
  try {
    const history = getHistoryByTelegramId(req.params.telegramId);
    res.json({ history });
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  getLatestResult,
  getHistory
};
