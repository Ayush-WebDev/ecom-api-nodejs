const attachCookie = async (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
    signed: true, // it can detect if the client manipulated cookie
  });
};

module.exports = attachCookie;
