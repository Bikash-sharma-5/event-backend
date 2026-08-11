require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Routes
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const adminAuthRoutes = require("./routes/adminAuth");
const lovedRoutes = require("./routes/loved");
const categoryRoutes = require("./routes/category");
const featuredProductRoutes = require("./routes/featuredProduct");
const bestSellerRoutes = require("./routes/bestSeller");
const bookingRoutes = require("./routes/bookingRoutes");
const cartRoutes = require("./routes/cart");
const heroCarouselRoutes = require("./routes/heroCarousel");
const sellerRoutes = require("./routes/seller");
const couponRoutes = require("./routes/coupon");
const blogRoutes = require("./routes/blog");
const videoRoutes = require("./routes/video");
const adminBookingRoutes = require("./routes/adminBookingRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const chatRoutes = require("./routes/chatRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const addonRoutes = require("./routes/addon");
const subCategoryRoutes = require("./routes/subCategoryRoutes");

// Controllers / Services
const settingsController = require("./controllers/settingsController");
const { initSocket } = require("./socket/socketSetup");
const { startMatchmakingSweep } = require("./controllers/Matchmakingsweep");

const app = express();

/*
|--------------------------------------------------------------------------
| Environment validation
|--------------------------------------------------------------------------
*/

if (!process.env.JWT_SECRET_SELLER) {
  console.error("❌ FATAL: JWT_SECRET_SELLER is not set.");
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set.");
  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://www.decoryy.com",
  "https://ballon-frontend.vercel.app",
  "https://ballon-admin-beta.vercel.app",
  "https://admin.decoryy.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],

    optionsSuccessStatus: 204,
  })
);

/*
|--------------------------------------------------------------------------
| Body parsing
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Payload error handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message:
        "Payload too large. Please reduce the size of your request.",
    });
  }

  next(err);
});

/*
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
| NO fs
| NO path
| NO mkdirSync
| NO local data directories
| NO express.static()
|
| Vercel should NOT be used as persistent file storage.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

// Products
app.use("/api/shop", productRoutes);
app.use("/api/products", productRoutes);

// Orders
app.use("/api/orders", orderRoutes);

// Authentication
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

// Admin bookings
app.use("/api/admin/bookings", adminBookingRoutes);

// Products
app.use("/api/bestseller", bestSellerRoutes);
app.use("/api/loved", lovedRoutes);
app.use("/api/featured-products", featuredProductRoutes);

// Categories
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);

// Cart
app.use("/api/cart", cartRoutes);

// Seller
app.use("/api/seller", sellerRoutes);

// Coupons
app.use("/api/coupons", couponRoutes);

// Bookings
app.use("/api/bookings", bookingRoutes);

// Hero carousel
app.use("/api/hero-carousel", heroCarouselRoutes);

// Blog
app.use("/api/blog", blogRoutes);

// Addons
app.use("/api/addons", addonRoutes);

// Videos
app.use("/api/videos", videoRoutes);

// Voice
app.use("/api/voice-gateway", voiceRoutes);

// Chat
app.use("/api/chat", chatRoutes);

// Banners
app.use("/api/banners", bannerRoutes);

// Other APIs
app.use("/api/data-page", require("./routes/dataPage"));
app.use("/api/cities", require("./routes/city"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/withdrawal", require("./routes/withdrawal"));
app.use("/api/commission", require("./routes/commission"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/msg91", require("./routes/msg91"));
app.use(
  "/api/pin-code-service-fees",
  require("./routes/pinCodeServiceFee")
);

/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production",
  });
});

/*
|--------------------------------------------------------------------------
| CORS test
|--------------------------------------------------------------------------
*/

app.get("/test-cors", (req, res) => {
  res.status(200).json({
    message: "CORS is working correctly",
    origin: req.headers.origin || null,
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| 404 handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| Global error handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

/*
|--------------------------------------------------------------------------
| Socket
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5175;

const httpServer = http.createServer(app);

const io = initSocket(httpServer);

app.set("io", io);

/*
|--------------------------------------------------------------------------
| MongoDB
|--------------------------------------------------------------------------
*/

mongoose.set("autoIndex", true);

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB connected successfully");

    try {
      await settingsController.initializeDefaultSettings();

      console.log(
        "✅ Default settings initialized successfully"
      );
    } catch (error) {
      console.error(
        "❌ Failed to initialize default settings:",
        error
      );
    }

    try {
      startMatchmakingSweep();

      console.log("✅ Matchmaking sweep started");
    } catch (error) {
      console.error(
        "❌ Failed to start matchmaking sweep:",
        error
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Local server
    |--------------------------------------------------------------------------
    */

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "❌ Failed to connect to MongoDB:",
      error
    );

    process.exit(1);
  }
}

startServer();