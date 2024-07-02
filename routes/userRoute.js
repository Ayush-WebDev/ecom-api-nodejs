const express = require("express");
const { authorizedMiddleware } = require("../middlewares/authentication");
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword,
  currentUser,
} = require("../controllers/userController");
const userRouter = express.Router();

userRouter.route("/").get(authorizedMiddleware("admin", "owner"), getAllUsers); /// In order to make the access groups dynamic as the app grows
userRouter.route("/update-password").patch(updateUserPassword);
userRouter.route("/current-user").get(currentUser);
userRouter.route("/:id").get(getSingleUser).patch(updateUser);
module.exports = userRouter;
