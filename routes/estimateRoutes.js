const express = require("express");
const router = express.Router();

const {
  createEstimate,
  getEstimates,
  getEstimateById,
  updateEstimate,
  deleteEstimate
} = require("../controllers/estimateController");
const { verifyTenant } = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// PROTECT ALL ESTIMATE ROUTES
router.use(verifyTenant);

/* ROUTES */
router.post("/", upload.single("logo"), createEstimate);
router.get("/", getEstimates);
router.get("/:id", getEstimateById);
router.put("/:id", upload.single("logo"), updateEstimate);
router.delete("/:id", deleteEstimate);

module.exports = router;