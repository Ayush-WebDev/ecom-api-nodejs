const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom-error");
const Product = require("../model/product");
const path = require("path");

const getAllProducts = async (req, res, next) => {
  const products = await Product.find({});
  if (!products) {
    throw new CustomAPIError("No products found", StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const createProduct = async (req, res, next) => {
  const product = await Product.create({
    ...req.body,
    user: req.user.id,
  });
  res.status(StatusCodes.OK).json({ msg: "success", product });
};

const getSingleProduct = async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id }).populate(
    "reviews"
  );
  if (!product) {
    throw new CustomAPIError(
      `No product found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res, next) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    { new: true, runValidators: true }
  );
  if (!product) {
    throw new CustomAPIError(
      `No product found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (!product) {
    throw new CustomAPIError(
      `No product found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  await product.deleteOne();
  //   const product = await Product.findOneAndDelete({ _id: req.params.id });
  //// We can also use the product.remove() method instead of findOneAndDelete
  res.status(StatusCodes.OK).json({ msg: "Product deleted successfully!" });
};

const uploadImage = async (req, res, next) => {
  if (!req.files || !req.files.image.mimetype.startsWith("image")) {
    throw new CustomAPIError("Please provide image", StatusCodes.BAD_REQUEST);
  }
  if (req.files.image.size >= Number(process.env.MAX_SIZE)) {
    throw new CustomAPIError(
      "Please provide image less than 1MB",
      StatusCodes.BAD_REQUEST
    );
  }
  const filePath = path.join(
    __dirname,
    "../public/uploads/" + `${req.files.image.name}`
  );
  req.files.image.mv(filePath);
  res
    .status(StatusCodes.OK)
    .json({ imageUrl: `/uploads/${req.files.image.name}` });
};

module.exports = {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
