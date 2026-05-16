const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const vendorController = require("../controllers/vendorController");
const { verifyTenant } = require("../middleware/authMiddleware");

// PROTECT ALL VENDOR ROUTES
router.use(verifyTenant);

router.post("/", upload.single("image"), vendorController.addVendor);
router.get("/", vendorController.getVendors);
router.get("/:id", vendorController.getVendorById);
router.put("/:id", upload.single("image"), vendorController.updateVendor);
router.delete("/:id", vendorController.deleteVendor);

module.exports = router;