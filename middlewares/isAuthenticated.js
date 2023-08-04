const User = require("../models/User");

const isAuthentificated = async (req, res, next) => {
  const tokenFound = req.headers.authorization.replace("Bearer ", "");
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: tokenFound,
    });

    //console.log(tokenFound);
    //console.log(user);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized1" });
    } else {
      req.user = user;
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized2" });
  }
};

module.exports = isAuthentificated;
