const Company = require("../models/Company");

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) return res.status(404).json({ success: false, message: "Company not found.", data: null });
    return res.status(200).json({ success: true, message: "Company profile retrieved successfully.", data: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to retrieve company profile.", data: null });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const allowedFields = ["name", "legalName", "email", "phone", "address"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    if (updates.email) {
      const duplicate = await Company.findOne({ email: updates.email.toLowerCase().trim(), _id: { $ne: req.user.company } });
      if (duplicate) return res.status(409).json({ success: false, message: "Company email already exists.", data: null });
      updates.email = updates.email.toLowerCase().trim();
    }
    const company = await Company.findByIdAndUpdate(req.user.company, updates, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, message: "Company not found.", data: null });
    return res.status(200).json({ success: true, message: "Company profile updated successfully.", data: company });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Company email already exists.", data: null });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message, data: null });
    return res.status(500).json({ success: false, message: "Unable to update company profile.", data: null });
  }
};
