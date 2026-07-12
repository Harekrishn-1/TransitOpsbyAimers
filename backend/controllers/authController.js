const jwt = require("jsonwebtoken");
const Company = require("../models/Company");
const User = require("../models/User");

function publicUser(user) {
  return { _id: user._id, company: user.company, name: user.name, email: user.email, phone: user.phone, employeeId: user.employeeId, roles: user.roles, isActive: user.isActive, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

function signToken(user) {
  if (!process.env.JWT_KEY) throw new Error("JWT_KEY is not configured.");
  return jwt.sign({ sub: user._id.toString(), company: user.company.toString(), roles: user.roles }, process.env.JWT_KEY, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
}

function errorResponse(error, res) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({ success: false, message: `${field} already exists.`, data: null });
  }
  if (error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message, data: null });
  if (error.message === "JWT_KEY is not configured.") return res.status(500).json({ success: false, message: error.message, data: null });
  return res.status(500).json({ success: false, message: "An unexpected error occurred.", data: null });
}

exports.registerCompany = async (req, res) => {
  let company;
  try {
    if (!process.env.JWT_KEY) return res.status(500).json({ success: false, message: "JWT_KEY is not configured.", data: null });
    const companyDetails = req.body.company || {};
    const adminDetails = req.body.admin || {};
    const name = companyDetails.name ?? req.body.companyName;
    const registrationNumber = companyDetails.registrationNumber ?? req.body.registrationNumber;
    const email = companyDetails.email ?? req.body.companyEmail;
    const phone = companyDetails.phone ?? req.body.companyPhone;
    const adminName = adminDetails.name ?? req.body.adminName;
    const adminEmail = adminDetails.email ?? req.body.adminEmail;
    const password = adminDetails.password ?? req.body.password;
    const adminPhone = adminDetails.phone ?? req.body.adminPhone;

    company = await Company.create({ name, legalName: companyDetails.legalName ?? req.body.legalName, registrationNumber, email, phone, address: companyDetails.address ?? req.body.address });
    const admin = await User.create({ company: company._id, name: adminName, email: adminEmail, password, phone: adminPhone, roles: ["COMPANY_ADMIN"] });
    const token = signToken(admin);
    return res.status(201).json({ success: true, message: "Company registered successfully.", data: { company, user: publicUser(admin), token } });
  } catch (error) {
    if (company) await Company.findByIdAndDelete(company._id);
    return errorResponse(error, res);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required.", data: null });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !user.isActive || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: "Invalid email or password.", data: null });
    const company = await Company.findById(user.company);
    if (!company || !company.isActive) return res.status(403).json({ success: false, message: "Company account is inactive.", data: null });
    const token = signToken(user);
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
