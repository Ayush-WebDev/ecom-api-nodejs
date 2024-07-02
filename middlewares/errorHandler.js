const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom-error");

const errorHandlerMiddleware = async (err, req, res, next) => {
  console.log(err);
  res.status(StatusCodes.BAD_REQUEST).json({ msg: err.message });
};

module.exports = errorHandlerMiddleware;
