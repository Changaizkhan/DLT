const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/database");

async function start() {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
