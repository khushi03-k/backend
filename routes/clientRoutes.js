const router =
  require("express").Router();

const {
  addClient,
  getClients,
  deleteClient,
  updateClient,
} = require(
  "../controllers/clientController"
);
const { verifyTenant } = require("../middleware/authMiddleware");

// PROTECT ALL CLIENT ROUTES
router.use(verifyTenant);

// base = /api/clients

router.post("/", addClient);

router.get("/", getClients);

router.delete("/:id", deleteClient);

router.put("/:id", updateClient);


module.exports = router;