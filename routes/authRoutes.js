const express = require("express");
const router = express.Router();
const { login, registerAdmin, registerTenant, getTenants, updateTenant } = require("../controllers/authController");
const { verifySuperAdmin } = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Public Routes
router.post("/login", login);
router.post("/register-admin", registerAdmin); // In production, secure this route or disable after setup

// Protected Routes (Only SuperAdmin can manage Tenants)
router.post("/register-tenant", verifySuperAdmin, upload.single("companyLogo"), registerTenant);
router.get("/tenants", verifySuperAdmin, getTenants);
router.put("/tenants/:id", verifySuperAdmin, upload.single("companyLogo"), updateTenant);

module.exports = router;
