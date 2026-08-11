const express = require("express");
const router = express.Router();
const multer = require("multer");

const { isAdmin, authenticateToken } = require("../middleware/auth");

const {
  getAllLovedProducts,
  getLovedProduct,
  createLovedProductWithFiles,
  updateLovedProductWithFiles,
  deleteLovedProduct,
} = require("../controllers/lovedController");

// IMPORTANT: Vercel cannot use persistent local disk storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
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

const handleUpload = (req, res, next) => {
  uploadImages(req, res, (err) => {
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

// Public
router.get("/", getAllLovedProducts);
router.get("/:id", getLovedProduct);

// Admin
router.post(
  "/",
  authenticateToken,
  isAdmin,
  handleUpload,
  createLovedProductWithFiles
);

router.post(
  "/upload",
  authenticateToken,
  isAdmin,
  handleUpload,
  createLovedProductWithFiles
);

router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  handleUpload,
  updateLovedProductWithFiles
);

router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  deleteLovedProduct
);

module.exports = router;