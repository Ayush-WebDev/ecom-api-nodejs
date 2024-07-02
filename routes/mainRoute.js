const express = require("express");
const { homePage } = require("../controllers/ecom");

const mainRouter = express.Router();

mainRouter.route("/").get(homePage);

module.exports = mainRouter;
