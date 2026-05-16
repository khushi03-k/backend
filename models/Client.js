const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },

  name: String,
  phone: String,
  email: String,
  address: String,
  project: String,
  totalAmount: Number,
  advance: Number,
  balance: Number,
  status: {
  type: String,
  default: "Active",
},
  clientId: {
    type: String,
  },

},
{
    timestamps: true,
  });

clientSchema.index({ tenantId: 1, clientId: 1 }, { unique: true });

module.exports =
  mongoose.model(
    "Client",
    clientSchema
  );