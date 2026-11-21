require("dotenv").config({ quiet: true });

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Database location
const databasePath = path.resolve(
    __dirname,
    process.env.DATABASE_PATH || "database.sqlite"
);

// Ensure database directory exists
fs.mkdirSync(path.dirname(databasePath), {
    recursive: true
});

// Connect to SQLite
const db = new Database(databasePath);

// Database configuration
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Load database schema
const schema = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf8"
);

// Create database tables
db.exec(schema);

// Check whether database has already been seeded
const seeded = db.prepare(
    "SELECT value FROM app_metadata WHERE key = ?"
).get("seeded");

// Insert starting records only once
if (!seeded) {
    const seed = fs.readFileSync(
        path.join(__dirname, "seed.sql"),
        "utf8"
    );

    const seedDatabase = db.transaction(() => {
        db.exec(seed);

        db.prepare(`
            INSERT INTO app_metadata (key, value)
            VALUES (?, ?)
        `).run("seeded", "true");
    });

    seedDatabase();

    console.log(
        "Eight starting records inserted successfully."
    );
}

console.log("SQLite database connected successfully.");

// Export database connection
module.exports = db;