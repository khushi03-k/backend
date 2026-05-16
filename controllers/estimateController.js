const Estimate = require("../models/estimateModel");

/* ================= CREATE ================= */
exports.createEstimate = async (req, res) => {
  try {
    let body = { ...req.body };

    // Parse items if it's a string (from FormData)
    if (typeof body.items === "string") {
      body.items = JSON.parse(body.items);
    }

    // Handle Logo File
    if (req.file) {
      body.logo = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
    }

    const { items } = body;

    // ✅ auto calculate total
    const totalEstimate = (items || []).reduce(
      (sum, i) => sum + (Number(i.qty || 0) * Number(i.rate || 0)),
      0
    );

    const estimate = await Estimate.create({
      ...body,
      tenantId: req.tenantId,
      totalEstimate,
    });

    res.status(201).json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET ALL ================= */
exports.getEstimates = async (req, res) => {
  try {
    const filter = req.role === "superadmin" ? {} : { tenantId: req.tenantId };
    const data = await Estimate.find(filter)
      .populate("tenantId", "companyName")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET ONE ================= */
exports.getEstimateById = async (req, res) => {
  try {
    const filter = req.role === "superadmin" ? { _id: req.params.id } : { _id: req.params.id, tenantId: req.tenantId };
    const data = await Estimate.findOne(filter);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateEstimate = async (req, res) => {
  try {
    let body = { ...req.body };

    if (typeof body.items === "string") {
      body.items = JSON.parse(body.items);
    }

    if (req.file) {
      body.logo = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
    }

    // Recalculate total if items updated
    if (body.items) {
      body.totalEstimate = body.items.reduce(
        (sum, i) => sum + (Number(i.qty || 0) * Number(i.rate || 0)),
        0
      );
    }

    const updated = await Estimate.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      body,
      { returnDocument: "after" }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE ================= */
exports.deleteEstimate = async (req, res) => {
  try {
    await Estimate.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};