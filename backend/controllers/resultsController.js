const { getLatestResultByTelegramId, getHistoryByTelegramId } = require("../services/resultsService");
const { sendError } = require("./http");

async function getLatestResult(req, res) {
  try {
    const result = await getLatestResultByTelegramId(req.params.telegramId);
    res.json({ result });
  } catch (error) {
    sendError(res, error);
  }
}

async function getHistory(req, res) {
  try {
    const history = await getHistoryByTelegramId(req.params.telegramId);
    res.json({ history });
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  getLatestResult,
  getHistory
};
