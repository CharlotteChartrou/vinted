const express = require("express");
const router = express.Router();

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

const Offer = require("../models/Offer");
const User = require("../models/User");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/offers", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    //console.log(req.body);
    //console.log(req.files.photo);
    const convertedFile = convertToBase64(req.files.photo);
    //console.log(convertedFile);
    const cloudinaryResponse = await cloudinary.uploader.upload(convertedFile);
    //console.log(cloudinaryResponse.secure_url);
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    //console.log(user.account.username);
    const newOffer = new Offer({
      product_name: req.body.title,
      product_description: req.body.description,
      product_price: req.body.price,
      product_details: [
        { MARQUE: req.body.brand },
        { TAILLE: req.body.size },
        { État: req.body.condition },
        { COULEUR: req.body.color },
        { EMPLACEMENT: req.body.city },
      ],
      product_image: { secure_url: cloudinaryResponse.secure_url },
      owner: user._id,
    });
    const newPost = {
      newOffer,
      owner: {
        account: user.account,
      },
    };
    //console.log(newPost);
    await newOffer.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(400).json("erreur publication de l'offre");
  }
});

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;

    const limitNumber = 3;

    const filters = {};
    if (title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (priceMax && priceMin) {
      filters.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    }
    if (priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }
    if (priceMax) {
      filters.product_price = { $lte: req.query.priceMax };
    }
    if (sort === "price-desc") {
      sort({ product_price: -1 });
    }
    if (sort === "price-asc") {
      sort({ product_price: 1 });
    }

    console.log({ filters });
    const offers = await Offer.find(filters)
      .select("product_name product_price -_id")
      .sort(sort)
      .limit(limitNumber)
      .skip((page - 1) * limitNumber);

    console.log(offers);

    res.status(200).json(offers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* router.get("offers/:_id", (req, res) => {
  try {
    res.status(200).json("article en cours de recherche");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}); */

router.delete("/offers/:_id", async (req, res) => {
  try {
    console.log(req.params._id);
    const task = await Task.findByIdAndDelete({ id: req.params._id });
    console.log(task);
    res.status(200).json("Offer delected");
  } catch (error) {
    res.status(400).json("not deleted");
  }
});

module.exports = router;
