const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = "mongodb+srv://stanu4singh:tanu123456@cluster0.fx8em.mongodb.net/ArchitectPlatform?appName=Cluster0";

async function fixIndexes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const db = mongoose.connection.db;

    // List of collections and the old unique index fields to drop
    const fixes = [
      { collection: "clients", index: "clientId_1" },
      { collection: "projects", index: "projectId_1" },
      { collection: "invoices", index: "invoiceNo_1" },
    ];

    for (const fix of fixes) {
      try {
        console.log(`Checking indexes for ${fix.collection}...`);
        const indexes = await db.collection(fix.collection).indexes();
        const hasIndex = indexes.some(idx => idx.name === fix.index);

        if (hasIndex) {
          console.log(`Dropping index ${fix.index} from ${fix.collection}...`);
          await db.collection(fix.collection).dropIndex(fix.index);
          console.log(`✅ Successfully dropped ${fix.index}`);
        } else {
          console.log(`ℹ️ Index ${fix.index} not found in ${fix.collection}, skipping.`);
        }
      } catch (err) {
        console.error(`❌ Error fixing ${fix.collection}:`, err.message);
      }
    }

    console.log("\n🚀 All done! Mongoose will recreate the new compound indexes on next start.");
    process.exit(0);
  } catch (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
}

fixIndexes();
