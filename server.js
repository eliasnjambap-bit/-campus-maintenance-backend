require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const db = require("./db");
const recordsRouter = require("./routes/records");

const app = express();

// ========================================
// CONFIGURATION
// ========================================

const port = process.env.PORT || 3000;

const origins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

// ========================================
// MIDDLEWARE
// ========================================

app.disable("x-powered-by");

app.use(cors({
    origin: origins
}));

app.use(express.json());

// ========================================
// API DOCUMENTATION
// GET /
// ========================================

app.get("/", (req, res) => {

    const baseUrl =
        process.env.PUBLIC_BASE_URL ||
        process.env.RENDER_EXTERNAL_URL ||
        `http://localhost:${port}`;

    res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Campus Maintenance API</title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: #f1f5f9;
            color: #1e293b;
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }

        header {
            background: #0f172a;
            color: white;
            padding: 45px 20px;
            text-align: center;
        }

        header h1 {
            margin: 10px 0;
            font-size: 30px;
        }

        header p {
            color: #cbd5e1;
        }

        .badge {
            display: inline-block;
            background: #166534;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 13px;
        }

        main {
            max-width: 1100px;
            margin: 30px auto;
            padding: 0 20px;
        }

        section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 12px;
            box-shadow: 0 3px 12px rgba(0,0,0,.06);
        }

        h2 {
            margin-top: 0;
            color: #0f172a;
        }

        .links {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        a.button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 10px 18px;
            text-decoration: none;
            border-radius: 6px;
        }

        a.button:hover {
            background: #1d4ed8;
        }

        .table-container {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
        }

        th {
            background: #0f172a;
            color: white;
        }

        tr:hover {
            background: #f8fafc;
        }

        .method {
            font-weight: bold;
        }

        .get {
            color: #2563eb;
        }

        .post {
            color: #15803d;
        }

        .put {
            color: #b45309;
        }

        .delete {
            color: #dc2626;
        }

        pre {
            background: #0f172a;
            color: #86efac;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
        }

        code {
            font-family: Consolas, monospace;
        }

        .note {
            background: #fef3c7;
            border-left: 4px solid #d97706;
            padding: 15px;
            border-radius: 4px;
        }

        footer {
            text-align: center;
            background: #0f172a;
            color: #cbd5e1;
            padding: 25px;
        }

        @media (max-width: 600px) {
            header h1 {
                font-size: 23px;
            }

            section {
                padding: 15px;
            }

            th, td {
                padding: 9px;
            }
        }

    </style>

</head>

<body>

<header>

    <span class="badge">API ONLINE</span>

    <h1>Campus Maintenance Management System</h1>

    <p>REST API Documentation</p>

    <p>Mulungushi University | ICT251 | Activity 7</p>

</header>

<main>

    <section>

        <h2>Project Information</h2>

        <p><strong>Student:</strong> Elias Njamba Phiri</p>

        <p><strong>Student Number:</strong> 202512831</p>

        <p><strong>Project:</strong>
           Campus Maintenance Management System</p>

        <p>
            This system allows students and lecturers to
            report maintenance problems in hostels,
            student rooms, lecturers' offices, classrooms
            and other university facilities.
        </p>

        <p>
            The backend uses Node.js, Express and SQLite
            to create, retrieve, update and delete
            maintenance records.
            All records contain demonstration data.
        </p>

        <p>
            <strong>API Base URL:</strong>
            <code>${baseUrl}</code>
        </p>

        <div class="links">

            <a class="button" href="/health">
                Health Check
            </a>

            <a class="button" href="/api/records">
                View All Records
            </a>

            <a class="button" href="/api/records/1">
                View Record 1
            </a>

        </div>

    </section>

    <section>

        <h2>API Endpoints</h2>

        <div class="table-container">

            <table>

                <thead>
                    <tr>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Description</th>
                        <th>Success</th>
                    </tr>
                </thead>

                <tbody>

                    <tr>
                        <td class="method get">GET</td>
                        <td>/</td>
                        <td>API documentation</td>
                        <td>200</td>
                    </tr>

                    <tr>
                        <td class="method get">GET</td>
                        <td>/health</td>
                        <td>Server and database check</td>
                        <td>200</td>
                    </tr>

                    <tr>
                        <td class="method get">GET</td>
                        <td>/api/records</td>
                        <td>Retrieve all records</td>
                        <td>200</td>
                    </tr>

                    <tr>
                        <td class="method get">GET</td>
                        <td>/api/records/:id</td>
                        <td>Retrieve one record</td>
                        <td>200</td>
                    </tr>

                    <tr>
                        <td class="method post">POST</td>
                        <td>/api/records</td>
                        <td>Create a record</td>
                        <td>201</td>
                    </tr>

                    <tr>
                        <td class="method put">PUT</td>
                        <td>/api/records/:id</td>
                        <td>Update a record</td>
                        <td>200</td>
                    </tr>

                    <tr>
                        <td class="method delete">DELETE</td>
                        <td>/api/records/:id</td>
                        <td>Delete a record</td>
                        <td>200</td>
                    </tr>

                </tbody>

            </table>

        </div>

    </section>

    <section>

        <h2>Data Agreement</h2>

        <div class="table-container">

            <table>

                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Type</th>
                        <th>Validation</th>
                    </tr>
                </thead>

                <tbody>

                    <tr>
                        <td>id</td>
                        <td>Integer</td>
                        <td>Automatically generated</td>
                    </tr>

                    <tr>
                        <td>title</td>
                        <td>String</td>
                        <td>3 to 80 characters</td>
                    </tr>

                    <tr>
                        <td>category</td>
                        <td>String</td>
                        <td>2 to 40 characters</td>
                    </tr>

                    <tr>
                        <td>description</td>
                        <td>String</td>
                        <td>5 to 300 characters</td>
                    </tr>

                    <tr>
                        <td>status</td>
                        <td>String</td>
                        <td>
                            Pending, In progress, Completed
                        </td>
                    </tr>

                </tbody>

            </table>

        </div>

    </section>

    <section>

        <h2>POST Request Example</h2>

        <p><strong>Endpoint:</strong> /api/records</p>

        <p>
            <strong>Content-Type:</strong>
            application/json
        </p>

        <pre><code>{
    "title": "Broken office window",
    "category": "Building",
    "description": "Lecturer report: Office 106. The window needs replacement.",
    "status": "Pending"
}</code></pre>

        <p>
            Successful response: 201 Created with the
            new record and its generated ID.
        </p>

    </section>

    <section>

        <h2>PUT Request Example</h2>

        <p><strong>Endpoint:</strong> /api/records/1</p>

        <p>
            PUT requires all four editable fields.
            The original ID remains unchanged.
        </p>

        <pre><code>{
    "title": "Repaired room light",
    "category": "Electrical",
    "description": "Student report: Hostel A, Room 12. The ceiling light has been repaired.",
    "status": "Completed"
}</code></pre>

    </section>

    <section>

        <h2>Response Status Codes</h2>

        <div class="table-container">

            <table>

                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Meaning</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>200</td>
                        <td>Request successful</td>
                    </tr>

                    <tr>
                        <td>201</td>
                        <td>Record created successfully</td>
                    </tr>

                    <tr>
                        <td>400</td>
                        <td>Invalid input or malformed JSON</td>
                    </tr>

                    <tr>
                        <td>404</td>
                        <td>Record or route not found</td>
                    </tr>

                    <tr>
                        <td>500</td>
                        <td>Unexpected server error</td>
                    </tr>

                    <tr>
                        <td>503</td>
                        <td>Database unavailable</td>
                    </tr>
                </tbody>

            </table>

        </div>

        <h3>Example Error Response</h3>

        <pre><code>{
    "message": "Record not found."
}</code></pre>

    </section>

    <section>

        <h2>Important Information</h2>

        <div class="note">

            An idle hosted service may take some time
            to start. Please wait and retry if the first
            request is delayed.

        </div>

        <p>
            GET requests can be tested using a browser.
            POST, PUT and DELETE requests require an API
            client such as Postman or PowerShell.
        </p>

        <p>
            This backend operates independently of the
            frontend and uses fictional records.
            Authentication, payments and file uploads
            are outside the scope of this activity.
        </p>

    </section>

</main>

<footer>

    Campus Maintenance Management System
    <br>
    Mulungushi University |
    ICT251 | Activity 7 | 2026

</footer>

</body>
</html>
    `);
});

// ========================================
// DATABASE HEALTH CHECK
// GET /health
// ========================================

app.get("/health", (req, res) => {
    try {
        db.prepare("SELECT 1").get();

        res.status(200).json({
            status: "OK",
            server: "Running",
            database: "Connected"
        });

    } catch (error) {
        console.error(error);

        res.status(503).json({
            message: "Database connection failed."
        });
    }
});

// ========================================
// MOUNT RECORD ROUTES
// ========================================

app.use("/api/records", recordsRouter);

// ========================================
// UNKNOWN ROUTES - 404
// ========================================

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((error, req, res, next) => {

    if (res.headersSent) {
        return next(error);
    }

    // Malformed JSON
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Malformed JSON request body."
        });
    }

    // Log unexpected errors
    console.error(error);

    // Generic server error
    res.status(500).json({
        message: "Internal server error."
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(port, "0.0.0.0", () => {

    console.log("-----------------------------------");
    console.log("Campus Maintenance Management System");
    console.log("Backend API running successfully.");
    console.log(`Server listening on port ${port}`);
    console.log(`Local URL: http://localhost:${port}`);
    console.log("-----------------------------------");

});