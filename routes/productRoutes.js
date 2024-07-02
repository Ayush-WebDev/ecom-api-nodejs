const express = require("express");
const productRouter = express.Router();
const {
  getAllProducts,
  createProduct,
  getSingleProduct,
  deleteProduct,
  updateProduct,
  uploadImage,
} = require("../controllers/productsController");
const {
  authMiddleware,
  authorizedMiddleware,
} = require("../middlewares/authentication");
const { getSingleProductReviews } = require("../controllers/reviewController");

productRouter
  .route("/")
  .get(authMiddleware, getAllProducts)
  .post([authMiddleware, authorizedMiddleware("admin")], createProduct);

productRouter
  .route("/upload-image")
  .post([authMiddleware, authorizedMiddleware("admin")], uploadImage);

productRouter
  .route("/:id")
  .get(authMiddleware, getSingleProduct)
  .patch([authMiddleware, authorizedMiddleware("admin")], updateProduct)
  .delete([authMiddleware, authorizedMiddleware("admin")], deleteProduct);

productRouter.route("/:id/reviews").get(getSingleProductReviews);
module.exports = productRouter;
