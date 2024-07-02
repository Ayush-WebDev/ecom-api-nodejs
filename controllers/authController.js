const { StatusCodes } = require("http-status-codes");
const User = require("../model/user");
const CustomAPIError = require("../errors/custom-error");
const attachCookie = require("../utils/cookie");
const register = async (req, res, next) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    throw new CustomAPIError("User already exists", StatusCodes.BAD_REQUEST);
  }
  const { email, password, name, roles } = req.body;
  const newUser = await User.create({
    email,
    name,
    password,
    roles: "user",
  });
  const token = await newUser.generateJWT();
  await attachCookie(res, token);
  res.status(StatusCodes.OK).json({ user: newUser });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomAPIError(
      "Please provide email and password",
      StatusCodes.BAD_REQUEST
    );
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new CustomAPIError("No user found", StatusCodes.NOT_FOUND);
  }

  let checkPass = await user.comparePassword(req.body.password);
  if (!checkPass) {
    throw new CustomAPIError("Unauthorized", StatusCodes.UNAUTHORIZED);
  }
  const token = await user.generateJWT();
  await attachCookie(res, token);
  res.status(StatusCodes.OK).json({ user: user });
};

const logout = async (req, res, next) => {
  /// We can remove the cookie and expire it immediately
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "Success logged out!" });
};

module.exports = { register, login, logout };
