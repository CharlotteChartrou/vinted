const express = require("express");
const router = express.Router();

const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;
//const isAuthentificated = require("./middlewares/isAuthentificated");

cloudinary.config({
  cloud_name: "dujlkkvmc",
  api_key: "551169559462953",
  api_secret: "RmE-BoJjONIPqMQ_6yrC2kTsguE",
  secure: true,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const convertedFile = convertToBase64(req.files.avatar);
    //console.log(convertedFile);
    const cloudinaryResponse = await cloudinary.uploader.upload(convertedFile);
    // console.log(cloudinaryResponse.secure_url);
    const password = req.body.password;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);

    const foundUser = await User.findOne({ email: req.body.email });
    if (req.body.username === "") {
      return res.status(400).json("username non renseigné");
    }
    if (foundUser === null) {
      const newUser = new User({
        email: req.body.email,
        account: {
          username: req.body.username,
          avatar: { secure_url: cloudinaryResponse.secure_url },
        },
        newsletter: req.body.newsletter,
        token,
        hash,
        salt,
      });

      await newUser.save();
      const responseObject = {
        _id: newUser._id,
        token: newUser.token,
        account: {
          username: newUser.account.username,
        },
      };
      res.status(200).json(responseObject);
    } else {
      return res.status(400).json("already exist");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json("error found222");
  }
});

module.exports = router;
