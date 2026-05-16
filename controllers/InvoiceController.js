const Invoice = require("../models/Invoice");

/* ================= CREATE ================= */
exports.createInvoice = async (req, res) => {
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

    let invoiceNo = body.invoiceNo;

    // IF NO INVOICE NO, GENERATE AUTOMATICALLY
    if (!invoiceNo) {
      const lastInvoice = await Invoice.findOne({ tenantId: req.tenantId }).sort({ createdAt: -1 });
      let nextNumber = 1001;

      if (lastInvoice && lastInvoice.invoiceNo) {
        // Extract number from INV-XXXX or similar
        const match = lastInvoice.invoiceNo.match(/\d+/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }
      invoiceNo = `INV-${nextNumber}`;
    }

    const invoice = new Invoice({ 
      ...body, 
      invoiceNo, // ✅ Inject Generated No
      tenantId: req.tenantId 
    });
    
    await invoice.save();

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= GET ALL (SEARCH + FILTER + DATE RANGE) ================= */
exports.getInvoices = async (req, res) => {
  try {
    const {
      search = "",
      filter = "all",
      startDate,
      endDate,
    } = req.query;

    const filterRole = req.role === "superadmin" ? {} : { tenantId: req.tenantId };
    let query = { ...filterRole };

    /* 🔍 SEARCH */
    if (search) {
      query.$or = [
        { invoiceName: { $regex: search, $options: "i" } },
        { invoiceNo: { $regex: search, $options: "i" } },
      ];

      // If SuperAdmin, also search by Tenant Company Name
      if (req.role === "superadmin") {
        const Tenant = require("../models/Tenant");
        const matchingTenants = await Tenant.find({
          companyName: { $regex: search, $options: "i" }
        }).select("_id");
        
        if (matchingTenants.length > 0) {
          query.$or.push({ tenantId: { $in: matchingTenants.map(t => t._id) } });
        }
      }
    }

    /* 📅 DATE FILTER */
    const now = new Date();

    if (filter === "day") {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));

      query.createdAt = { $gte: start, $lte: end };
    }

    if (filter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      query.createdAt = { $gte: start, $lte: end };
    }

    if (filter === "year") {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);

      query.createdAt = { $gte: start, $lte: end };
    }

    /* 📅 CUSTOM RANGE */
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const invoices = await Invoice.find(query)
      .populate("tenantId", "companyName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= GET SINGLE ================= */
exports.getInvoiceById = async (req, res) => {
  try {
    const filter = req.role === "superadmin" ? { _id: req.params.id } : { _id: req.params.id, tenantId: req.tenantId };
    const invoice = await Invoice.findOne(filter);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateInvoice = async (req, res) => {
  try {
    let body = { ...req.body };

    if (typeof body.items === "string") {
      body.items = JSON.parse(body.items);
    }

    if (req.file) {
      body.logo = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
    }

    const updated = await Invoice.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      body,
      { returnDocument: "after", runValidators: true }
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= DELETE ================= */
exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};