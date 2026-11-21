const express = require("express");
const { db } = require("../db");

const router = express.Router();

// Allowed record statuses
const allowedStatuses = [
    "Pending",
    "In progress",
    "Completed"
];

// ========================================
// VALIDATE RECORD ID
// ========================================

function validateId(value) {
    const id = Number(value);

    if (
        !/^[0-9]+$/.test(value) ||
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        return null;
    }

    return id;
}

// ========================================
// VALIDATE RECORD INPUT
// ========================================

function validateRecord(body) {
    const fields = [
        ["title", "Title", 3, 80],
        ["category", "Category", 2, 40],
        ["description", "Description", 5, 300]
    ];

    for (const [field, label, min, max] of fields) {
        if (typeof body?.[field] !== "string") {
            return `${label} must be a string.`;
        }

        const value = body[field].trim();

        if (
            value.length < min ||
            value.length > max
        ) {
            return `${label} must have ${min} to ${max} characters.`;
        }
    }

    if (
        typeof body?.status !== "string" ||
        !allowedStatuses.includes(body.status.trim())
    ) {
        return "Status must be Pending, In progress or Completed.";
    }

    return null;
}

// ========================================
// GET ALL RECORDS
// GET /api/records
// ========================================

router.get("/", async (req, res, next) => {
    try {
        const result = await db.execute(`
            SELECT id, title, category,
                   description, status
            FROM records
            ORDER BY id
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        next(error);
    }
});

// ========================================
// GET ONE RECORD
// GET /api/records/:id
// ========================================

router.get("/:id", async (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const result = await db.execute({
            sql: `
                SELECT id, title, category,
                       description, status
                FROM records
                WHERE id = ?
            `,
            args: [id]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        next(error);
    }
});

// ========================================
// CREATE A RECORD
// POST /api/records
// ========================================

router.post("/", async (req, res, next) => {
    try {
        const validationError = validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const title = req.body.title.trim();
        const category = req.body.category.trim();
        const description = req.body.description.trim();
        const status = req.body.status.trim();

        const result = await db.execute({
            sql: `
                INSERT INTO records
                (title, category, description, status)
                VALUES (?, ?, ?, ?)
            `,
            args: [
                title,
                category,
                description,
                status
            ]
        });

        const newRecordResult = await db.execute({
            sql: `
                SELECT id, title, category,
                       description, status
                FROM records
                WHERE id = ?
            `,
            args: [result.lastInsertRowid]
        });

        res.status(201).json(newRecordResult.rows[0]);

    } catch (error) {
        next(error);
    }
});

// ========================================
// UPDATE A RECORD
// PUT /api/records/:id
// ========================================

router.put("/:id", async (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const validationError = validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const title = req.body.title.trim();
        const category = req.body.category.trim();
        const description = req.body.description.trim();
        const status = req.body.status.trim();

        const result = await db.execute({
            sql: `
                UPDATE records
                SET title = ?,
                    category = ?,
                    description = ?,
                    status = ?
                WHERE id = ?
            `,
            args: [
                title,
                category,
                description,
                status,
                id
            ]
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        const updatedResult = await db.execute({
            sql: `
                SELECT id, title, category,
                       description, status
                FROM records
                WHERE id = ?
            `,
            args: [id]
        });

        res.status(200).json(updatedResult.rows[0]);

    } catch (error) {
        next(error);
    }
});

// ========================================
// DELETE A RECORD
// DELETE /api/records/:id
// ========================================

router.delete("/:id", async (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const result = await db.execute({
            sql: `
                DELETE FROM records
                WHERE id = ?
            `,
            args: [id]
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json({
            message: "Record deleted."
        });

    } catch (error) {
        next(error);
    }
});

// Export router
module.exports = router;