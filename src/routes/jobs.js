import express from "express";
import pool from "../db.js";
import { resultTypes } from "../enums/resultTypes.js";

const router = express.Router();

router.get("/result-types", (req, res) => {
    res.json(resultTypes);
});
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get("/", async (_req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM jobs ORDER BY id DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get one job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved job
 */
router.get("/:id", async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM jobs WHERE id = $1`, [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *                 description: The name of the company
 *                 example: "Acme Corp"
 *               title:
 *                 type: string
 *                 description: The job title
 *                 example: "Software Engineer"
 *               cover_letter:
 *                 type: boolean
 *                 description: Cover letter content
 *                 example: false
 *               expectation:
 *                 type: number
 *                 description: 3
 *               result:
 *                 type: string
 *                 description: Result of the job application
 *               company_rate:
 *                 type: number
 *                 description: Rating of the company
 *                 example: 3
 *               referral:
 *                 type: boolean
 *                 description: 1
 *                 example: false
 *               custom_fields:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Any custom fields for this job
 *               remark:
 *                 type: string
 *                 additionalProperties: true
 *                 description: Comments on the job
 *                 example: "comments on the job"
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique ID of the created job
 *                 company:
 *                   type: string
 *                 title:
 *                   type: string
 */
router.post("/", async (req, res) => {
    const {
        company,
        title,
        applied_at,
        cover_letter,
        expectation,
        result,
        company_rate,
        referral,
        custom_fields,
        remark,
    } = req.body;
    const cleanedExpectation = expectation === "" ? null : expectation;
    const cleanedCompanyRate = company_rate === "" ? null : company_rate;
    const cleanedAppliedAt =
        applied_at === undefined || applied_at === "" || applied_at === null ? new Date() : applied_at;
    try {
        const { rows } = await pool.query(
            `
      INSERT INTO jobs
      (company, title, cover_letter, expectation, result, company_rate, referral, custom_fields, remark, applied_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
            [
                company,
                title,
                cover_letter,
                cleanedExpectation,
                result,
                cleanedCompanyRate,
                referral,
                custom_fields ?? {},
                remark,
                cleanedAppliedAt,
            ]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update an existing job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *                 description: The name of the company
 *                 example: "Acme Corp"
 *               title:
 *                 type: string
 *                 description: The job title
 *                 example: "Software Engineer"
 *               cover_letter:
 *                 type: boolean
 *                 description: Whether a cover letter is included
 *                 example: true
 *               expectation:
 *                 type: number
 *                 description: Expectation for getting a  reply
 *                 example: 2
 *               result:
 *                 type: string
 *                 description: Result of the job application
 *                 example: "Rejected"
 *               company_rate:
 *                 type: number
 *                 description: Rating of the company
 *                 example: 4
 *               referral:
 *                 type: boolean
 *                 description: Whether there is a referral
 *                 example: false
 *               custom_fields:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Any custom fields for this job
 *               remark:
 *                 type: string
 *                 additionalProperties: true
 *                 description: Comments on the job
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique ID of the created job
 *                 company:
 *                   type: string
 *                 title:
 *                   type: string
 */
router.put("/:id", async (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");

    try {
        const { rows } = await pool.query(
            `
      UPDATE jobs
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *
      `,
            [...values, req.params.id]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job by ID
 *     description: Deletes the job with the specified ID from the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the delete operation was successful
 *                   example: true
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Database error"
 */
router.delete("/:id", async (req, res) => {
    try {
        await pool.query(`DELETE FROM jobs WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
