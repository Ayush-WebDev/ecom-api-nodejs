const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom-error");
const Product = require("../model/product");
const Order = require("../model/order");
const checkPermissions = require("../utils/checkPermissions");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "somevalue";
  const paymentId = Math.random() * 100000000000;
  return { client_secret, paymentId };
};

const getAllOrders = async (req, res, next) => {
  const orders = await Order.find({});
  if (!orders) {
    throw new CustomAPIError("No orders found", StatusCodes.NOT_FOUND);
  }
  res
    .status(StatusCodes.CREATED)
    .json({ orders, count: orders.length, msg: "success" });
};

const getSingleOrder = async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomAPIError(
      `No user found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });
  if (!orders) {
    throw new CustomAPIError(
      `No orders found for user with id ${req.user.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: "success", orders, count: orders.length });
};
const createOrder = async (req, res, next) => {
  const { shippingFee, tax, cartItems } = req.body;
  if (!shippingFee || !tax) {
    throw new CustomAPIError(
      "Please provide tax and shipping fee",
      StatusCodes.BAD_REQUEST
    );
  }

  if (!cartItems || cartItems.length < 1) {
    throw new CustomAPIError(
      "Please provide products",
      StatusCodes.BAD_REQUEST
    );
  }
  let productsArr = [];
  let subTotal = 0;

  /// As the await is required for the search of the product that is not directly possible for the forEach so we use for of mehtod
  for (const item of cartItems) {
    let cartProd = await Product.findOne({ _id: item.product });
    if (!cartProd) {
      throw new CustomAPIError(
        `No product found with id ${item.product}`,
        StatusCodes.NOT_FOUND
      );
    }
    const { name, price, image } = cartProd;
    const singleOrderItem = {
      name,
      price,
      image,
      product: item.product,
      amount: item.amount,
    };
    productsArr = [...productsArr, singleOrderItem];
    subTotal += item.amount * item.price;
  }
  let total = subTotal + tax + shippingFee;
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    clientSecret: paymentIntent.client_secret,
    orderItems: productsArr,
    subTotal,
    total,
    tax,
    shippingFee,
    user: req.user.id,
    status: "Pending",
  });
  res.status(StatusCodes.OK).json({ msg: "success", order });
};
const updateOrder = async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomAPIError(
      `No user found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  checkPermissions(req.user, order.user);
  order.paymentId = req.body.paymentId;
  order.status = "Paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order, msg: "success" });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
