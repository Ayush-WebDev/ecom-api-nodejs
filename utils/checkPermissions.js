const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom-error");

const checkPermissions = async (requestUser, resourceUserId) => {
  if (requestUser.roles === "admin") return;
  if (requestUser.id === resourceUserId.toString()) return;
  throw new CustomAPIError(
    "Not authorized to access this route",
    StatusCodes.UNAUTHORIZED
  );
};

module.exports = checkPermissions;
