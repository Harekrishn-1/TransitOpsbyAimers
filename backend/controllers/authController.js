const Company = require("../models/Company");
const User = require("../models/User");
const { getJwtConfig, signUserToken } = require("../utils/token");

function normalizeEmail(email) {
  return typeof email === "string" ? email.toLowerCase().trim() : "";
}

function publicUser(user) {
  return { _id: user._id, company: user.company, name: user.name, email: user.email, phone: user.phone, employeeId: user.employeeId, roles: user.roles, isActive: user.isActive, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

function errorResponse(error, res) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({ success: false, message: `${field} already exists.`, data: null });
  }
  if (error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message, data: null });
  if (error.message.startsWith("JWT_KEY")) return res.status(500).json({ success: false, message: error.message, data: null });
  return res.status(500).json({ success: false, message: "An unexpected error occurred.", data: null });
}

exports.registerCompany = async (req, res) => {
  let company;
  try {
    getJwtConfig();
    const companyDetails = req.body.company || {};
    const adminDetails = req.body.admin || {};
    const { name, registrationNumber, email, phone, legalName, address } = companyDetails;
    const { name: adminName, email: adminEmail, password, phone: adminPhone } = adminDetails;

    company = await Company.create({ name, legalName, registrationNumber, email, phone, address });
    const admin = await User.create({ company: company._id, name: adminName, email: adminEmail, password, phone: adminPhone, roles: ["COMPANY_ADMIN"] });
    const token = signUserToken(admin);
    return res.status(201).json({ success: true, message: "Company registered successfully.", data: { company, user: publicUser(admin), token } });
  } catch (error) {
    if (company) await Company.findByIdAndDelete(company._id);
    return errorResponse(error, res);
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required.", data: null });

    const user = await User.findOne({ email }).select("+password");
    const passwordMatches = user && user.isActive && user.password && (await user.comparePassword(password));
    if (!passwordMatches) return res.status(401).json({ success: false, message: "Invalid email or password.", data: null });
    const company = await Company.findById(user.company);
    if (!company || !company.isActive) return res.status(403).json({ success: false, message: "Company account is inactive.", data: null });
    const token = signUserToken(user);
    return res.status(200).json({ success: true, message: "Login successful.", data: { user: publicUser(user), company, token } });
  } catch (error) {
    return errorResponse(error, res);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout successful.", data: null });
};

exports.me = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    return res.status(200).json({ success: true, message: "Current user retrieved successfully.", data: { user: publicUser(req.user), company } });
  } catch (error) {
    return errorResponse(error, res);
  }
};
