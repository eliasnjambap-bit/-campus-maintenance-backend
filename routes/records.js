const express = require("express");
const db = require("../db");

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
        typeof body.status !== "string" ||
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

router.get("/", (req, res, next) => {
    try {
        const records = db.prepare(`
            SELECT id, title, category,
                   description, status
            FROM records
            ORDER BY id
        `).all();

        res.status(200).json(records);

    } catch (error) {
        next(error);
    }
});

// ========================================
// GET ONE RECORD
// GET /api/records/:id
// ========================================

router.get("/:id", (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const record = db.prepare(`
            SELECT * FROM records
            WHERE id = ?
        `).get(id);

        if (!record) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(record);

    } catch (error) {
        next(error);
    }
});

// ========================================
// CREATE A RECORD
// POST /api/records
// ========================================

router.post("/", (req, res, next) => {
    try {
        const validationError =
            validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const title = req.body.title.trim();
        const category = req.body.category.trim();
        const description = req.body.description.trim();
        const status = req.body.status.trim();

        const result = db.prepare(`
            INSERT INTO records
            (title, category, description, status)
            VALUES (?, ?, ?, ?)
        `).run(
            title,
            category,
            description,
            status
        );

        const newRecord = db.prepare(`
            SELECT * FROM records
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newRecord);

    } catch (error) {
        next(error);
    }
});

// ========================================
// UPDATE A RECORD
// PUT /api/records/:id
// ========================================

router.put("/:id", (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const validationError =
            validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const title = req.body.title.trim();
        const category = req.body.category.trim();
        const description = req.body.description.trim();
        const status = req.body.status.trim();

        const result = db.prepare(`
            UPDATE records
            SET title = ?,
                category = ?,
                description = ?,
                status = ?
            WHERE id = ?
        `).run(
            title,
            category,
            description,
            status,
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        const updatedRecord = db.prepare(`
            SELECT * FROM records
            WHERE id = ?
        `).get(id);

        res.status(200).json(updatedRecord);

    } catch (error) {
        next(error);
    }
});

// ========================================
// DELETE A RECORD
// DELETE /api/records/:id
// ========================================

router.delete("/:id", (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const result = db.prepare(`
            DELETE FROM records
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
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