const mongoose = require("mongoose");

async function connectDatabase() {
  if (!process.env.DB_CONNECT_STRING) {
    throw new Error("DB_CONNECT_STRING is not configured.");
  }

  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log("MongoDB connected.");
}

module.exports = connectDatabase;
