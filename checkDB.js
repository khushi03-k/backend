const mongoose = require("mongoose");
const Project = require("./models/Project");
const Client = require("./models/Client");
const Tenant = require("./models/Tenant");
require("dotenv").config();

async function check() {
  await mongoose.connect("mongodb+srv://stanu4singh:tanu123456@cluster0.fx8em.mongodb.net/ArchitectPlatform?appName=Cluster0");
  
  const projects = await Project.countDocuments();
  const projectsNoTenant = await Project.countDocuments({ tenantId: { $exists: false } });
  
  const clients = await Client.countDocuments();
  const clientsNoTenant = await Client.countDocuments({ tenantId: { $exists: false } });

  const tenants = await Tenant.find();

  console.log("Projects:", projects, "(Missing TenantId:", projectsNoTenant, ")");
  console.log("Clients:", clients, "(Missing TenantId:", clientsNoTenant, ")");
  console.log("Total Tenants:", tenants.length);
  if (tenants.length > 0) {
    console.log("First Tenant ID:", tenants[0]._id);
  }

  process.exit();
}

check();
