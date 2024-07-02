const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom-error");

const authMiddleware = async (req, res, next) => {
  const { token } = req.signedCookies;
  try {
    const { name, id, email, roles } = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = { name, id, email, roles };
    next();
  } catch (error) {
    throw new CustomAPIError(
      "Unauthorized to access the route",
      StatusCodes.UNAUTHORIZED
    );
  }
};

const authorizedMiddleware = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      throw new CustomAPIError(
        "Unauthorized to access the route",
        StatusCodes.UNAUTHORIZED
      );
    }
    next();
  };
  //   const { token } = req.signedCookies;
  //   const { roles } = token;
  //   if (roles !== "admin" || !roles.startsWith("admin")) {
  //     throw new CustomAPIError(
  //       "Only admin can access this resource",
  //       StatusCodes.UNAUTHORIZED
  //     );
  //   }
};

module.exports = { authMiddleware, authorizedMiddleware };
