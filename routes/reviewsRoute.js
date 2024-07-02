const express = require("express");
const {
  getAllReviews,
  updateReview,
  getSingleReview,
  deleteReview,
  createReview,
} = require("../controllers/reviewController");
const {
  authMiddleware,
  authorizedMiddleware,
} = require("../middlewares/authentication");
const reviewRouter = express.Router();

reviewRouter
  .route("/")
  .get([authMiddleware, authorizedMiddleware("admin")], getAllReviews)
  .post(authMiddleware, createReview);

reviewRouter
  .route("/:id")
  .get(authMiddleware, getSingleReview)
  .patch(authMiddleware, updateReview)
  .delete(authMiddleware, deleteReview);

module.exports = reviewRouter;
