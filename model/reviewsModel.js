const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      required: [true, "Please provide rating"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide rating"],
      maxlength: 500,
    },
    user: {
      type: mongoose.Schema.ObjectId, /// In order to make connection between models we use mongoose.Schema.ObjectId
      ref: "users", ///ref is based on the schema name that is used for the model
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "products",
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.statics.calculateAverageRating = async function (productId) {
  /// This works with function not arrow function
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("products").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post("deleteOne", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

//** To make sure that each user submits only one review per product **//
//** Compound indexing **//
reviewSchema.index({ product: 1, user: 1 }, { unique: 1 });

const Review = mongoose.model("reviews", reviewSchema);

module.exports = Review;
