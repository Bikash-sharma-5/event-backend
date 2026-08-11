
const express = require("express");
const router = express.Router();
const multer = require("multer");

const { isAdmin, authenticateToken } = require("../middleware/auth");

const {
  getAllFeaturedProducts,
  getFeaturedProduct,
  createFeaturedProductWithFiles,
  updateFeaturedProductWithFiles,
  deleteFeaturedProduct,
} = require("../controllers/featuredProductController");

// ============================================================
// MULTER CONFIGURATION
// IMPORTANT: Do NOT use diskStorage() on Vercel.
// ============================================================

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per image
    files: 10,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// ============================================================
// UPLOAD FIELDS
// ============================================================

const uploadImages = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
  { name: "image5", maxCount: 1 },
  { name: "image6", maxCount: 1 },
  { name: "image7", maxCount: 1 },
  { name: "image8", maxCount: 1 },
  { name: "image9", maxCount: 1 },
]);

// ============================================================
// MULTER ERROR HANDLER
// ============================================================

const handleUpload = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: "File upload error",
        details: err.message,
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        error: "File upload error",
        details: err.message,
      });
    }

    next();
  });
};

// ============================================================
// VALIDATE FILES
// ============================================================

const validateFiles = (req, res, next) => {
  if (!req.files) {
    return next();
  }

  for (const fieldName of Object.keys(req.files)) {
    const files = req.files[fieldName];

    if (!Array.isArray(files)) {
      continue;
    }

    for (const file of files) {
      if (!file.buffer) {
        return res.status(400).json({
          success: false,
          error: `Invalid uploaded file: ${fieldName}`,
        });
      }
    }
  }

  next();
};

// ============================================================
// PUBLIC ROUTES
// ============================================================

router.get("/", getAllFeaturedProducts);

router.get("/:id", getFeaturedProduct);

// ============================================================
// ADMIN ROUTES
// ============================================================

router.post(
  "/",
  authenticateToken,
  isAdmin,
  handleUpload,
  validateFiles,
  createFeaturedProductWithFiles
);

router.post(
  "/upload",
  authenticateToken,
  isAdmin,
  handleUpload,
  validateFiles,
  createFeaturedProductWithFiles
);

router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  handleUpload,
  validateFiles,
  updateFeaturedProductWithFiles
);

router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  deleteFeaturedProduct
);

module.exports = router;

