import express from "express";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Yield Calculation API
  app.post("/api/calculate-yield", (req, res) => {
    const { acres } = req.body;
    
    // Simple yield logic: acres * factor
    // 1 acre is approx 4046.86 sq meters
    const acresNum = parseFloat(acres);
    const yieldFactorPerAcre = 2000; // kg per acre (example)
    const expectedYield = acresNum * yieldFactorPerAcre;

    res.json({ 
      acres: acresNum, 
      expectedYield,
      unit: "kg"
    });
  });

  // Simple SHA-256 Caching Logic for Image Consistency
  // This is a mock implementation of a cache check
  const imageCache = new Map();

  app.post("/api/check-image-cache", (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "No image provided" });

    const hash = crypto.createHash('sha256').update(imageBase64).digest('hex');
    
    if (imageCache.has(hash)) {
      return res.json({ cached: true, data: imageCache.get(hash) });
    }

    res.json({ cached: false, hash });
  });

  app.post("/api/save-image-cache", (req, res) => {
    const { hash, data } = req.body;
    imageCache.set(hash, data);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
