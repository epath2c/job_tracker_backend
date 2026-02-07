import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all jobs
router.get("/", async (req, res) => {
    const result = await pool.query("SELECT * FROM jobs ORDER BY id DESC");
    res.json(result.rows);
});
export default router;

// Create
router.post("/", async (req, res) => {
    const { title, company } = req.body;
    const result = await pool.query("INSERT INTO jobs (title, company) VALUES ($1, ($2)) RETURNING *", [
        title,
        company,
    ]);
    res.json(result.rows[0]);
});

// Update
router.put("/:id", async (req, res) => {
    const { title, company } = req.body;
    const { id } = req.params;
    const result = await pool.query(
        `
      UPDATE jobs
      SET title = $1,
          company = $2
      WHERE id = $3
      RETURNING *
      `,
        [title, company, id]
    );
});

// Delete
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
    res.json({ success: true });
});
