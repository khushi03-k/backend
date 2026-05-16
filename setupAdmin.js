const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const SuperAdmin = require("./models/SuperAdmin");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect("mongodb+srv://stanu4singh:tanu123456@cluster0.fx8em.mongodb.net/ArchitectPlatform?appName=Cluster0").then(async () => {
  console.log("MongoDB Connected...");

  const email = "superadmin@architectcrm.com";
  const password = "Admin@123";

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Check if admin already exists
  const existingAdmin = await SuperAdmin.findOne({ email: "admin@architectcrm.com" }) || await SuperAdmin.findOne({ email });
  
  if (existingAdmin) {
    console.log("Updating existing admin...");
    existingAdmin.email = email;
    existingAdmin.password = hashedPassword;
    await existingAdmin.save();
    console.log("✅ Super Admin updated successfully!");
  } else {
    // Create Admin
    await SuperAdmin.create({
      name: "Architect CRM Admin",
      email: email,
      password: hashedPassword,
    });
    console.log("✅ Super Admin successfully created!");
  }

  console.log("You can now go to the React login page and use:");
  console.log("Email:", email);
  console.log("Password:", password);
  
  process.exit();
}).catch((err) => {
  console.error("Database connection error:", err);
  process.exit(1);
});
