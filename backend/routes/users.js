const express = require("express");
const { postUpsertUser } = require("../controllers/usersController");

const router = express.Router();

router.post("/upsert", postUpsertUser);

module.exports = router;
