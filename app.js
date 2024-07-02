require("dotenv").config();
require("express-async-errors");

const express = require("express");
const morgan = require("morgan");
const port = process.env.PORT || 5000;
const connectDB = require("./db/connectDB");
const cookieParser = require("cookie-parser");
const notFoundMiddleware = require("./middlewares/notFound");
const errorHandlerMiddleware = require("./middlewares/errorHandler");
const mainRouter = require("./routes/mainRoute");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewsRoute");
const orderRouter = require("./routes/order");
const rateLimiter = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const fileUpload = require("express-fileupload");
const { authMiddleware } = require("./middlewares/authentication");
const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 1000 * 60,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());
app.use("/", mainRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authMiddleware, userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI_PATH);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
