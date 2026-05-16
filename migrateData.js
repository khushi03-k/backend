const mongoose = require("mongoose");
const Project = require("./models/Project");
const Client = require("./models/Client");
const Tenant = require("./models/Tenant");
const Vendor = require("./models/vendor");
const Invoice = require("./models/Invoice");
const Category = require("./models/Category");
const Estimate = require("./models/estimateModel");

require("dotenv").config();

async function migrate() {
  await mongoose.connect("mongodb+srv://stanu4singh:tanu123456@cluster0.fx8em.mongodb.net/ArchitectPlatform?appName=Cluster0");
  
  const tenant = await Tenant.findOne();
  if (!tenant) {
    console.error("No Tenant found! Create a tenant first.");
    process.exit();
  }

  const tenantId = tenant._id;
  console.log("Migrating all data to Tenant:", tenant.companyName, `(${tenantId})`);

  const filter = { tenantId: { $exists: false } };
  const update = { $set: { tenantId } };

  const p = await Project.updateMany(filter, update);
  const c = await Client.updateMany(filter, update);
  const v = await Vendor.updateMany(filter, update);
  const i = await Invoice.updateMany(filter, update);
  const cat = await Category.updateMany(filter, update);
  const est = await Estimate.updateMany(filter, update);

  console.log("Projects updated:", p.modifiedCount);
  console.log("Clients updated:", c.modifiedCount);
  console.log("Vendors updated:", v.modifiedCount);
  console.log("Invoices updated:", i.modifiedCount);
  console.log("Categories updated:", cat.modifiedCount);
  console.log("Estimates updated:", est.modifiedCount);

  process.exit();
}

migrate();
