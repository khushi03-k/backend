const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  name: { type: String, required: true },
  image: String,
});

module.exports = mongoose.model("Category", categorySchema);