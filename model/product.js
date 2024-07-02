const mongoose = require("mongoose");
const Review = require("./reviewsModel");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide value"],
    },
    price: {
      type: Number,
      required: [true, "Please provide value"],
    },
    description: {
      type: String,
      required: [true, "Please provide value"],
    },
    image: {
      type: String,
      default: "/uploads/default.png", /// default image location
      required: [true, "Please provide value"],
    },
    category: {
      type: String,
      required: [true, "Please provide value"],
      enum: {
        values: ["kitchen", "office", "bedroom"],
        message: "{VALUE} is not supported",
      },
    },
    company: {
      type: String,
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
      required: [true, "Please provide value"],
    },
    colors: {
      type: [String], /// string with array
      default: ["#222"],
      required: [true, "Please provide value"],
    },
    featured: {
      type: Boolean,
      required: [true, "Please provide value"],
      default: false,
    },
    freeShipping: {
      type: Boolean,
      required: [true, "Please provide value"],
      default: false,
    },
    inventory: {
      type: Number,
      required: [true, "Please provide value"],
      default: 15,
    },
    averageRating: {
      type: Number,
      required: [true, "Please provide value"],
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide value"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//**Setup of virtuals for the virtual connection between the collections: product to review  **//
//** This virtuals data can't be queried */
productSchema.virtual("reviews", {
  ref: "reviews", /// referece model name used for collection
  localField: "_id", /// The field that is connected to review schema
  foreignField: "product", /// field in reviews
  justOne: false,
  // match: { rating: 5 },
});

//// Remove all the reviews when a product is deleted

productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await this.model("reviews").deleteMany({ product: this._id }); // With this.model we can access the model also any other model
    //await Review.deleteMany({ product: this._id });
    next();
  }
);

const Product = mongoose.model("products", productSchema);

module.exports = Product;
