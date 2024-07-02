const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide email",
    },
    unique: true,
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please fill a valid email address",
    // ],
  },
  password: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 8,
  },
  roles: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

userSchema.pre("save", async function () {
  if (!this.modifiedPaths("password")) return; ///// this is to avoid hashing of the password again
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (userPass) {
  const isMatch = await bcrypt.compare(userPass, this.password);
  return isMatch;
};

userSchema.methods.generateJWT = async function () {
  const token = await jwt.sign(
    {
      name: this.name,
      email: this.email,
      roles: this.roles,
      id: this.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
  return token;
};

const User = mongoose.model("users", userSchema);

module.exports = User;
