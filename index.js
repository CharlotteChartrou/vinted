require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const fileUpload = require("express-fileupload");

const app = express();
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

app.get("/", (req, res) => {
  try {
    return res.status(200).json("Welcome to Vinted");
  } catch (error) {
    return res.status(400).json("message error");
  }
});

const signupRoutes = require("./routes/signup");
app.use(signupRoutes);

const loginRoutes = require("./routes/login");
app.use(loginRoutes);

const offersRoutes = require("./routes/offers");
app.use(offersRoutes);

app.all("*", (req, res) => {
  return res.status(404).json("not found");
});

app.listen(process.env.PORT, () => {
  console.log("server started!");
});
