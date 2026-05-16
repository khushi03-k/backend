const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { verifyTenant } = require("../middleware/authMiddleware");

// PROTECT ALL CATEGORY ROUTES
router.use(verifyTenant);

router.get("/", getCategories);
router.post("/", upload.single("image"), addCategory);
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;