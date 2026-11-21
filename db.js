require("dotenv").config({ quiet: true });

const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

// Check Turso configuration
if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is missing.");
}

if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_AUTH_TOKEN is missing.");
}

// Connect to Turso
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

// Initialize database
async function initializeDatabase() {
    // Load SQL files
    const schema = fs.readFileSync(
        path.join(__dirname, "schema.sql"),
        "utf8"
    );

    const seed = fs.readFileSync(
        path.join(__dirname, "seed.sql"),
        "utf8"
    );

    // Create tables
    await db.executeMultiple(schema);

    // Check whether starting records already exist
    const result = await db.execute({
        sql: "SELECT value FROM app_metadata WHERE key = ?",
        args: ["seeded"]
    });

    // Insert starting records only once
    if (result.rows.length === 0) {
        const transaction = await db.transaction("write");

        try {
            await transaction.executeMultiple(seed);

            await transaction.execute({
                sql: `
                    INSERT INTO app_metadata (key, value)
                    VALUES (?, ?)
                `,
                args: ["seeded", "true"]
            });

            await transaction.commit();

            console.log(
                "Eight starting records inserted successfully."
            );
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    console.log("Turso cloud database connected successfully.");
}

// Export connection and initialization function
module.exports = {
    db,
    initializeDatabase
};