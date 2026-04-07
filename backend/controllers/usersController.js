const { upsertUser } = require("../services/usersService");
const { sendError } = require("./http");

function postUpsertUser(req, res) {
  try {
    const user = upsertUser(req.body || {});
    res.json({ user });
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  postUpsertUser
};
