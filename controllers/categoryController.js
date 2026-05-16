const Category = require("../models/Category");

// GET all categories
exports.getCategories = async (req, res) => {
  try {
    const filter = req.role === "superadmin" ? {} : { tenantId: req.tenantId };
    const data = await Category.find(filter).populate("tenantId", "companyName");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD category
exports.addCategory = async (req, res) => {
  try {
    let image = "";
    if (req.file) {
      image = "http://localhost:5000/uploads/" + req.file.filename;
    }
    const newCat = new Category({ ...req.body, image, tenantId: req.tenantId });
    await newCat.save();
    res.json(newCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE category
exports.updateCategory = async (req, res) => {
  try {
    const updatedData = { ...req.body };
    if (req.file) {
      updatedData.image = "http://localhost:5000/uploads/" + req.file.filename;
    }
    const data = await Category.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updatedData,
      { returnDocument: "after" }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
