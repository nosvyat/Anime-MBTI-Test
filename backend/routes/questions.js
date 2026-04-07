const express = require("express");
const { getByMode } = require("../controllers/questionsController");

const router = express.Router();

router.get("/:mode", getByMode);

module.exports = router;
