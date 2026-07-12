const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const driverRoutes = require("../Routes/driverRoutes");
const vehicleRoutes = require("../Routes/vehicleRoutes");
const authRoutes = require("../Routes/authRoutes");
const companyRoutes = require("../Routes/companyRoutes");
const userRoutes = require("../Routes/userRoutes");
const { authenticate } = require("../middlewares/authMiddleware");

const maintenanceRoutes = require("../Routes/maintananceRoutes");
const fuelLogRoutes = require("../Routes/feulLogRoutes");
const dashboardRoutes = require("../Routes/dashboardRoutes");
const reportRoutes = require("../Routes/reportRoutes");
const expenseRoutes = require("../Routes/expenseRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/expenses", expenseRoutes);

app.use("/drivers", authenticate, driverRoutes);
app.use("/vehicles", authenticate, vehicleRoutes);
app.use("/auth", authRoutes);
app.use("/company", companyRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TransitOps Backend Running 🚀"
    });
});

module.exports = app;
