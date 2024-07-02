const { StatusCodes } = require("http-status-codes");
const homePage = async (req, res) => {
  console.log(req.signedCookies);
  res.status(StatusCodes.OK).json({ msg: "Success" });
};

module.exports = { homePage };
