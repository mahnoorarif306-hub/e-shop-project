const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter product description!"],
  },
  category: {
    type: String,
    required: [true, "Please enter product category!"],
  },
  tags: {
    type: String,
  },
  images: {
    type: [mongoose.Schema.Types.Mixed],
    validate: {
      validator: (images) =>
        Array.isArray(images) &&
        images.every(
          (image) =>
            (typeof image === "string" && image.length > 0) ||
            (image &&
              typeof image === "object" &&
              typeof image.public_id === "string" &&
              typeof image.url === "string")
        ),
      message: "Product images must be URLs or Cloudinary image objects.",
    },
  },
  discountPrice: {
    type: Number,
    required: [true, "Please enter discounted price!"],
  },
  originalPrice: {
    type: Number,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  sold_out: {
    type: Number,
    default: 0,
    min: 0,
  },
  shopId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Shop",
  required: true,
},
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rating: {
        type: Number,
        default: 0,
      },
      comment: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
