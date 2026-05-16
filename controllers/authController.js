const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Tenant = require("../models/Tenant");
const SuperAdmin = require("../models/SuperAdmin");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "your_secret_key", {
    expiresIn: "30d",
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);

  try {
    // 1. Check if user is SuperAdmin
    const superAdmin = await SuperAdmin.findOne({ email });
    if (superAdmin) {
      console.log("Found SuperAdmin:", email);
      if (await bcrypt.compare(password, superAdmin.password)) {
        console.log("SuperAdmin login successful");
        return res.json({
          _id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: "superadmin",
          token: generateToken(superAdmin._id, "superadmin"),
        });
      } else {
        console.log("SuperAdmin password mismatch");
      }
    }

    // 2. Check if user is Tenant
    const tenant = await Tenant.findOne({ email });
    if (tenant) {
      console.log("Found Tenant:", email, "Status:", tenant.status);
      if (tenant.status !== "Active") {
         console.log("Tenant account is inactive");
         return res.status(403).json({ message: "Account is inactive. Please contact admin." });
      }
      
      if (await bcrypt.compare(password, tenant.password)) {
        console.log("Tenant login successful");
        return res.json({
          _id: tenant._id,
          companyName: tenant.companyName,
          companyLogo: tenant.companyLogo,
          address: tenant.address,
          phone: tenant.phone,
          gstNumber: tenant.gstNumber,
          ownerName: tenant.ownerName,
          specialization: tenant.specialization,
          regNo: tenant.regNo,
          email: tenant.email,
          role: "tenant",
          token: generateToken(tenant._id, "tenant"),
        });
      } else {
        console.log("Tenant password mismatch");
      }
    }

    console.log("Login failed: Invalid email or password");
    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Register a new SuperAdmin (Run once manually to create first admin)
// @route   POST /api/auth/register-admin
exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const adminExists = await SuperAdmin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: "Admin already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const superAdmin = await SuperAdmin.create({
      name,
      email,
      password: hashedPassword,
    });

    if (superAdmin) {
      res.status(201).json({ message: "Admin created successfully" });
    } else {
      res.status(400).json({ message: "Invalid admin data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Register a new Tenant (Usually done by SuperAdmin)
// @route   POST /api/auth/register-tenant
exports.registerTenant = async (req, res) => {
  const { email, password, companyName, planName, expiryDate, address, phone, gstNumber } = req.body;
  
  try {
    const tenantExists = await Tenant.findOne({ email });
    if (tenantExists) return res.status(400).json({ message: "Tenant already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let companyLogo = "";
    if (req.file) {
      companyLogo = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
    }

    const tenant = await Tenant.create({
      email,
      password: hashedPassword,
      companyName,
      companyLogo,
      address,
      phone,
      gstNumber,
      planName,
      expiryDate,
      status: "Active"
    });

    if (tenant) {
      res.status(201).json({ message: "Tenant created successfully" });
    } else {
      res.status(400).json({ message: "Invalid tenant data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tenants
// @route   GET /api/auth/tenants
exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tenant status/plan/profile
// @route   PUT /api/auth/tenants/:id
exports.updateTenant = async (req, res) => {
  try {
    let body = { ...req.body };

    if (req.file) {
      body.companyLogo = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
    }

    // Only hash password if it's being updated
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    } else {
      delete body.password;
    }

    const tenant = await Tenant.findByIdAndUpdate(req.params.id, body, { returnDocument: "after" });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
