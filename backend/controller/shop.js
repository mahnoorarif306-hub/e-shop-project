const express = require("express");
const path = require("path");
const router = express.Router();
const crypto = require("crypto");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShopToken = require("../utils/shopToken");
const { getFrontendUrl } = require("../utils/frontendUrl");
const {
  createActivationToken,
  consumeActivationToken,
} = require("../utils/activationToken");

// create shop
router.post("/create-shop", catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password, address, phoneNumber, zipCode } = req.body;

    if (!name || !email || !password || !address || !phoneNumber || !zipCode) {
      return next(new ErrorHandler("Please provide all required fields", 400));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedZipCode = String(zipCode).trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/.test(normalizedZipCode)) {
      return next(
        new ErrorHandler("Please enter a valid zip/postal code", 400)
      );
    }

    const sellerEmail = await Shop.findOne({ email: normalizedEmail });
    if (sellerEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    let avatarObj = {
      public_id: "default",
      url: "https://ui-avatars.com/api/?name=User&background=3321c8&color=fff&size=150",
    };

    if (req.body.avatar) {
      try {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
        });
        avatarObj = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError.message);
      }
    }

    const seller = {
      name,
      email: normalizedEmail,
      password,
      avatar: avatarObj,
      address,
      phoneNumber,
      zipCode: normalizedZipCode,
    };

    const activationToken = await createActivationToken("shop", seller);
    const frontendUrl = getFrontendUrl(req);
    const activationUrl = `${frontendUrl}/seller/activation/${activationToken}`;

    let emailSent = false;
    try {
      await sendMail({
        email: seller.email,
        subject: "Activate your Shop",
        message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
      });
      emailSent = true;
    } catch (mailError) {
      console.error("Shop activation email failed:", mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? `Please check your email: ${seller.email} to activate. You can also use the link below.`
        : `Shop registered! Click the activation link below to continue.`,
      activationUrl,
      emailSent,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}));

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const pendingSeller = await consumeActivationToken(
        "shop",
        activation_token
      );
      if (!pendingSeller) {
        return next(
          new ErrorHandler("Activation link is invalid or expired.", 400)
        );
      }
      const normalizedEmail = pendingSeller.email;

      let seller = await Shop.findOne({ email: normalizedEmail });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      const sellerDoc = new Shop({
        name: pendingSeller.name,
        email: normalizedEmail,
        avatar: pendingSeller.avatar,
        password: pendingSeller.passwordHash,
        zipCode: pendingSeller.zipCode,
        address: pendingSeller.address,
        phoneNumber: pendingSeller.phoneNumber,
      });
      sellerDoc.$locals.passwordIsHashed = true;
      seller = await sellerDoc.save();

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const user = await Shop.findOne({ email: normalizedEmail }).select(
        "+password"
      );

      if (!user) {
        return next(
          new ErrorHandler(
            'Email or password is incorrect. Use "Forgot your password?" to reset it.',
            400
          )
        );
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler(
            'Email or password is incorrect. Use "Forgot your password?" to reset it.',
            400
          )
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return next(new ErrorHandler("Please provide your email address.", 400));
    }

    const shop = await Shop.findOne({ email });
    if (shop) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      shop.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      shop.resetPasswordTime = Date.now() + 15 * 60 * 1000;
      await shop.save({ validateBeforeSave: false });

      const resetUrl = `${getFrontendUrl(req)}/shop-reset-password/${resetToken}`;
      try {
        await sendMail({
          email,
          subject: "Reset your E-Shop seller password",
          message: `Use this link within 15 minutes to reset your seller password: ${resetUrl}`,
        });
      } catch (error) {
        shop.resetPasswordToken = undefined;
        shop.resetPasswordTime = undefined;
        await shop.save({ validateBeforeSave: false });
        return next(
          new ErrorHandler(
            "The reset email could not be sent. Please try again later.",
            500
          )
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "If a seller account exists for that email, a password reset link has been sent.",
    });
  })
);

router.put(
  "/reset-password/:token",
  catchAsyncErrors(async (req, res, next) => {
    const { password, confirmPassword } = req.body;

    if (typeof password !== "string" || password.length < 6) {
      return next(
        new ErrorHandler("Password must be at least 6 characters.", 400)
      );
    }
    if (password !== confirmPassword) {
      return next(new ErrorHandler("Passwords do not match.", 400));
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const shop = await Shop.findOne({
      resetPasswordToken,
      resetPasswordTime: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordTime");

    if (!shop) {
      return next(
        new ErrorHandler("This password reset link is invalid or expired.", 400)
      );
    }

    shop.password = password;
    shop.resetPasswordToken = undefined;
    shop.resetPasswordTime = undefined;
    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in.",
    });
  })
);

// load shop (seller dashboard)
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      return res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// log out from shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "PRODUCTION" ? "none" : "lax",
        secure: process.env.NODE_ENV === "PRODUCTION",
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
router.put(
  "/update-shop-avatar",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let existsSeller = await Shop.findById(req.seller._id);

        const imageId = existsSeller.avatar?.public_id;

        if (imageId && imageId !== "default") {
          await cloudinary.v2.uploader.destroy(imageId);
        }

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
        });

        existsSeller.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

  
      await existsSeller.save();

      res.status(200).json({
        success: true,
        seller:existsSeller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller ---admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw merthods --- only seller
router.delete(
  "/delete-withdraw-method/",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;