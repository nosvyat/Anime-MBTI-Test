const express = require("express");
const { getByType } = require("../controllers/charactersController");

const router = express.Router();

router.get("/by-type/:mbtiType", getByType);

module.exports = router;
