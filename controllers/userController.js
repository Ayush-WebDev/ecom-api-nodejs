const { StatusCodes } = require("http-status-codes");
const createUserToken = require("../utils/createUserToken");
const attachCookie = require("../utils/cookie");
const checkPermissions = require("../utils/checkPermissions");
const User = require("../model/user");
const CustomAPIError = require("../errors/custom-error");

const getAllUsers = async (req, res) => {
  const users = await User.find({ roles: "user" }).select("-password");
  if (!users) {
    throw new CustomAPIError("No Users found!", StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json({ users: users, count: users.length });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, roles: "user" }).select(
    "-password"
  );
  if (!user) {
    throw new CustomAPIError(
      `No user found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
  await checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const currentUser = async (req, res, next) => {
  const { id, name, roles } = req.user;
  res.status(StatusCodes.OK).json({ user: { id, name, roles } });
};

const updateUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      throw new CustomAPIError(
        "Please provide email and name",
        StatusCodes.BAD_REQUEST
      );
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { email, name },
      { new: true, runValidators: true }
    ).select("-password -email");
    const token = await user.generateJWT();
    await attachCookie(res, token);
    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    throw new CustomAPIError(
      `No user found with id ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  }
};

const updateUserPassword = async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  if (!newPassword || !oldPassword) {
    throw new CustomAPIError("Invalid credentials", StatusCodes.BAD_REQUEST);
  }
  const user = await User.findOne({ _id: req.user.id });
  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    throw new CustomAPIError(
      "Unauthenticated request",
      StatusCodes.UNAUTHORIZED
    );
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserPassword,
  currentUser,
};
