const { upsertUser } = require("../services/usersService");
const { sendError } = require("./http");

async function postUpsertUser(req, res) {
  try {
    const user = await upsertUser(req.body || {});
    res.json({ user });
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  postUpsertUser
};
