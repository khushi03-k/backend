const router = require("express").Router();
const controller = require("../controllers/InvoiceController");
const { verifyTenant } = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// PROTECT ALL INVOICE ROUTES
router.use(verifyTenant);

router.post("/", upload.single("logo"), controller.createInvoice);
router.get("/", controller.getInvoices);
router.get("/:id", controller.getInvoiceById);
router.put("/:id", upload.single("logo"), controller.updateInvoice);
router.delete("/:id", controller.deleteInvoice);

module.exports = router;