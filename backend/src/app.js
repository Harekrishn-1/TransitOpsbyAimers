const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const tripRoutes = require("./Routes/tripRoutes");
const errorHandler = require("./middlewares/errorHandler");

app.use("/api/trips", tripRoutes);

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(errorHandler);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TransitOps Backend Running 🚀"
    });
});

module.exports = app;