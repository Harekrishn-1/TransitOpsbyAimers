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

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

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
