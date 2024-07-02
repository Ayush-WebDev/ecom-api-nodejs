const createUserToken = async (user) => {
  return {
    name: user.name,
    userId: user._id,
    roles: user.roles,
  };
};

module.exports = createUserToken;
