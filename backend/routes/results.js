const express = require("express");
const { getLatestResult, getHistory } = require("../controllers/resultsController");

const router = express.Router();

router.get("/latest/:telegramId", getLatestResult);
router.get("/history/:telegramId", getHistory);

module.exports = router;
