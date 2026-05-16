const Vendor = require("../models/vendor");

// ================= ADD VENDOR =================
exports.addVendor = async (req, res) => {
  try {
    const data = { ...req.body, tenantId: req.tenantId }; // ✅ Inject Tenant ID

    if (req.file) {
      data.image = "http://localhost:5000/uploads/" + req.file.filename;
    }

    if (data.category) {
      data.category = data.category.trim();
    }

    // Parse materials if sent as string (from FormData)
    if (typeof data.materials === "string") {
      data.materials = JSON.parse(data.materials);
    }

    const vendor = new Vendor(data);
    await vendor.save();

    res.json({ data: vendor });
  } catch (err) {
    console.error("ADD VENDOR ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET VENDORS =================
exports.getVendors = async (req, res) => {
  try {
    const { category } = req.query;

    const filterRole = req.role === "superadmin" ? {} : { tenantId: req.tenantId };
    const filter = category
      ? { ...filterRole, category: { $regex: new RegExp(`^${category}$`, "i") } }
      : filterRole;

    let query = Vendor.find(filter);
    if (req.role === "superadmin") {
      query = query.populate("tenantId", "companyName");
    }
    const data = await query;

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET SINGLE VENDOR =================
exports.getVendorById = async (req, res) => {
  try {
    const filter = req.role === "superadmin" ? { _id: req.params.id } : { _id: req.params.id, tenantId: req.tenantId };
    const data = await Vendor.findOne(filter);

    if (!data) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE VENDOR =================
exports.updateVendor = async (req, res) => {
  try {
    const updatedData = { ...req.body };

    if (req.file) {
      updatedData.image = "http://localhost:5000/uploads/" + req.file.filename;
    }

    if (updatedData.category) {
      updatedData.category = updatedData.category.trim();
    }

    if (typeof updatedData.materials === "string") {
      updatedData.materials = JSON.parse(updatedData.materials);
    }

    const updated = await Vendor.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updatedData,
      { returnDocument: "after" }
    );

    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= DELETE VENDOR =================
exports.deleteVendor = async (req, res) => {
  try {
    await Vendor.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};