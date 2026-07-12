const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDatabase = require("./db");
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error.message);
    process.exit(1);
  }
}

startServer();
