const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom-error");
const Review = require("../model/reviewsModel");
const Product = require("../model/product");
const checkPermissions = require("../utils/checkPermissions");

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomAPIError(
      `No product found with id ${productId}`,
      StatusCodes.NOT_FOUND
    );
  }
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user.id,
  });
  if (existingReview) {
    throw new CustomAPIError("Review already exists", StatusCodes.BAD_REQUEST);
  }
  const review = await Review.create({ ...req.body, user: req.user.id });
  res.status(StatusCodes.OK).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({ path: "user", select: "name" }); /// Path is the key used in the schema
  if (!reviews) {
    throw new CustomAPIError(`No reviews found`, StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new CustomAPIError(
      `No review found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { rating, comment, title } = req.body;
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new CustomAPIError(
      `No review found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new CustomAPIError(
      `No review found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  checkPermissions(req.user, review.user);
  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "success" });
};

const getSingleProductReviews = async (req, res, next) => {
  const reviews = await Review.find({ product: req.params.id });
  if (!reviews) {
    throw new CustomAPIError(
      `No review found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }

  res.status(StatusCodes.OK).json({ reviews });
};

module.exports = {
  getAllReviews,
  updateReview,
  getSingleReview,
  deleteReview,
  createReview,
  getSingleProductReviews,
};
