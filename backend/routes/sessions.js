const express = require("express");
const {
  getActiveSession,
  postStartSession,
  postAnswer,
  postProgress,
  postComplete
} = require("../controllers/sessionsController");

const router = express.Router();

router.get("/active/:telegramId", getActiveSession);
router.post("/start", postStartSession);
router.post("/:id/answer", postAnswer);
router.post("/:id/progress", postProgress);
router.post("/:id/complete", postComplete);

module.exports = router;
