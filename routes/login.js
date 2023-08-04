const express = require("express");
const router = express.Router();

const User = require("../models/User.js");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const foundUser = await User.findOne({ email: req.body.email });
    console.log(foundUser);
    const newSaltedPassword = req.body.password + foundUser.salt;
    const newHash = SHA256(newSaltedPassword).toString(encBase64);
    console.log(newSaltedPassword);
    console.log(newHash);

    if (newHash === foundUser.hash) {
      return res.status(200).json("le password est bon");
    } else {
      return res.status(400).json("le password n'est pas bon");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json("error login");
  }
});

module.exports = router;
