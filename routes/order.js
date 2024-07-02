const express = require("express");

const orderRouter = express.Router();

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers/order");
const {
  authMiddleware,
  authorizedMiddleware,
} = require("../middlewares/authentication");

orderRouter
  .route("/")
  .get([authMiddleware, authorizedMiddleware("admin")], getAllOrders)
  .post(authMiddleware, createOrder);
orderRouter.route("/my-orders").get(authMiddleware, getCurrentUserOrders);
orderRouter
  .route("/:id")
  .get(authMiddleware, getSingleOrder)
  .patch(authMiddleware, updateOrder);

module.exports = orderRouter;
