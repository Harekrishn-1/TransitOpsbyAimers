const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const maintenanceRoutes = require("../Routes/maintenanceRoutes");
const fuelLogRoutes = require("../Routes/fuelLogRoutes");
const dashboardRoutes = require("../Routes/dashboardRoutes");
const reportRoutes = require("./Routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TransitOps Backend Running 🚀"
    });
});

module.exports = app;