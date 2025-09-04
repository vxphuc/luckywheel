const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: process.env.ALLOW_ORIGIN || "http://localhost:3000", // CRA = 3000
  credentials: true,
}));
app.use(express.json());

// Debug: in file & routes đang chạy
console.log("👉 Running server file:", __filename);
setImmediate(() => {
  console.log("👉 Routes loaded:");
  app._router?.stack?.filter(r => r.route)?.forEach(r => {
    const methods = Object.keys(r.route.methods).map(m => m.toUpperCase()).join(",");
    console.log(`${methods} ${r.route.path}`);
  });
});

app.get("/", (_req, res) => res.send("🎉 LuckyWheel Backend is running."));

app.get("/api/prizes", async (_req, res) => {
  try {
    const db = await connectDB();
    let wheel = await db.collection("wheel").findOne({ _id: "main" });
    if (!wheel) {
      wheel = {
        _id: "main",
        prizes: [
          { label: "iPhone",  weight: 1 },
          { label: "Laptop",  weight: 2 },
          { label: "Voucher", weight: 3 },
          { label: "Tai nghe", weight: 4 },
          { label: "Cốc nước", weight: 10 },
        ],
      };
      await db.collection("wheel").insertOne(wheel); // ← object, không phải array
    }
    res.json(wheel.prizes);
  } catch (err) {
    console.error("GET /api/prizes error:", err);
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

// CHỈ DÙNG POST để ghi đè toàn bộ danh sách (KHÔNG insertOne array)
app.post("/api/prizes", async (req, res) => {
  try {
    const prizes = req.body; // FE gửi MẢNG
    if (!Array.isArray(prizes)) {
      return res.status(400).json({ message: "Body must be an array of prizes" });
    }
    const cleaned = prizes.map(p => ({
      label: String(p.label ?? "").trim(),
      weight: Number(p.weight ?? 1) || 1,
    }));

    const db = await connectDB();
    await db.collection("wheel").updateOne(
      { _id: "main" },
      { $set: { prizes: cleaned } },
      { upsert: true }
    );
    res.json({ message: "✅ Saved prizes successfully", prizes: cleaned });
  } catch (err) {
    console.error("POST /api/prizes error:", err);
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

app.post("/api/spins", async (req, res) => {
  try {
    const { label } = req.body;
    if (!label || typeof label !== "string") {
      return res.status(400).json({ message: "label is required (string)" });
    }

    const db = await connectDB();

    // (khuyến nghị) xác thực label có trong danh sách hiện tại
    const wheel = await db.collection("wheel").findOne({ _id: "main" });
    const exists = (wheel?.prizes || []).some(p => p.label === label);
    if (!exists) {
      console.warn("Spin label not in current prize list:", label);
    }

    const doc = {
      label,
      at: new Date(),
      ip: req.ip,
      ua: req.headers["user-agent"] || "",
    };

    const result = await db.collection("spins").insertOne(doc);
    res.json({ message: "✅ Logged spin", id: result.insertedId, ...doc });
  } catch (err) {
    console.error("POST /api/spins error:", err);
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

app.get("/api/spins", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const db = await connectDB();
    const items = await db
      .collection("spins")
      .find({})
      .sort({ at: -1 })
      .limit(limit)
      .toArray();
    res.json(items);
  } catch (err) {
    console.error("GET /api/spins error:", err);
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

app.get("/api/spins/stats", async (_req, res) => {
  try {
    const db = await connectDB();
    const stats = await db.collection("spins").aggregate([
      { $group: { _id: "$label", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]).toArray();
    res.json(stats.map(s => ({ label: s._id, count: s.count })));
  } catch (err) {
    console.error("GET /api/spins/stats error:", err);
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
