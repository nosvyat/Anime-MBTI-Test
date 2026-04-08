const express = require("express");
const path = require("node:path");
const { initializeDatabase } = require("./db/init");
const { dialect } = require("./db/database");

async function startServer() {
  await initializeDatabase();

  const app = express();
  const port = Number(process.env.PORT || 3000);
  const frontendPath = path.join(__dirname, "..", "frontend");

  app.use(express.json({ limit: "1mb" }));
  app.use(express.static(frontendPath));

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "anime-mbti-test-api",
      database: dialect
    });
  });

  app.use("/api/users", require("./routes/users"));
  app.use("/api/sessions", require("./routes/sessions"));
  app.use("/api/results", require("./routes/results"));
  app.use("/api/characters", require("./routes/characters"));
  app.use("/api/questions", require("./routes/questions"));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ error: "API route not found" });
      return;
    }

    res.sendFile(path.join(frontendPath, "index.html"));
  });

  app.listen(port, () => {
    console.log(`Anime MBTI Test server is running on http://127.0.0.1:${port} using ${dialect}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Anime MBTI Test server", error);
  process.exit(1);
});
