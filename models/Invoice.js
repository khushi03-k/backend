const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hsn: String,
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    invoiceName: { type: String, required: true },
    email: String,
    company: String,
    address: String,
    gstin: String,
    phone: String,
    logo: String,

    invoiceNo: { type: String, required: true },
    date: { type: Date, required: true },

    clientGstin: String,

    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },

    items: [itemSchema],

    subtotal: Number,
    total: Number,
  },
  { timestamps: true }
);

invoiceSchema.index({ tenantId: 1, invoiceNo: 1 }, { unique: true });

module.exports = mongoose.model("Invoice", invoiceSchema);