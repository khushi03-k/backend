const jwt = require("jsonwebtoken");
const Tenant = require("../models/Tenant");

exports.verifyTenant = async (req, res, next) => {
  const token = req.header("Authorization");
  
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "your_secret_key"
    );

    // Allow BOTH tenants and superadmins
    if (decoded.role !== "tenant" && decoded.role !== "superadmin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    req.role = decoded.role;
    req.tenantId = decoded.id; // In login, we used .id for the mongo _id

    // ✅ STATUS CHECK for Tenants (SuperAdmins skip this)
    if (req.role === "tenant") {
      const tenant = await Tenant.findById(req.tenantId);
      if (!tenant || tenant.status !== "Active") {
        return res.status(403).json({ msg: "Account is inactive or not found" });
      }
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

exports.verifySuperAdmin = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "your_secret_key"
    );

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ msg: "Access denied: Super Admins only" });
    }

    req.superAdminId = decoded.superAdminId;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
