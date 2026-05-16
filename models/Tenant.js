const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    // Owner Credentials
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Subscription Info
    planName: {
      type: String,
      enum: ["1-Year", "2-Year", "Custom"],
      default: "1-Year",
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    activationDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },

    // Company Profile (For Invoices & UI)
    companyName: { type: String, required: true },
    companyLogo: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    specialization: { type: String, default: "" },
    regNo: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
