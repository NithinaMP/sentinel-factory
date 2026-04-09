import express from "express";
import { getPool } from "../db/database.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ── Save a mission ──────────────────────
router.post("/", authMiddleware, async (req, res) => {
  const {
    title, personality, source_text, fact_sheet,
    blog_content, social_content, email_content,
    total_attempts, confidence, audit_trail
  } = req.body;

  try {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO missions 
       (user_id, title, personality, source_text, fact_sheet, blog_content, social_content, email_content, total_attempts, confidence, audit_trail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title || "Untitled Mission",
        personality || "professional",
        source_text?.slice(0, 5000) || "",
        JSON.stringify(fact_sheet || {}),
        blog_content || "",
        social_content || "",
        email_content || "",
        total_attempts || 1,
        confidence || 95,
        JSON.stringify(audit_trail || []),
      ]
    );

    res.status(201).json({ id: result.insertId, message: "Mission saved." });
  } catch (err) {
    console.error("Save mission error:", err.message);
    res.status(500).json({ error: "Failed to save mission." });
  }
});

// ── Get all missions for user ───────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, title, personality, total_attempts, confidence, status, created_at
       FROM missions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get missions error:", err.message);
    res.status(500).json({ error: "Failed to fetch missions." });
  }
});

// ── Get one mission detail ──────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT * FROM missions WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Mission not found." });

    const m = rows[0];
    res.json({
      ...m,
      fact_sheet: JSON.parse(m.fact_sheet || "{}"),
      audit_trail: JSON.parse(m.audit_trail || "[]"),
    });
  } catch (err) {
    console.error("Get mission error:", err.message);
    res.status(500).json({ error: "Failed to fetch mission." });
  }
});

// ── Delete a mission ────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    await pool.execute(
      "DELETE FROM missions WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Mission deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete mission." });
  }
});

export default router;