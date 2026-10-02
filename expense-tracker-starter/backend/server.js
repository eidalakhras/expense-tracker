// Expense Tracker - backend (Express API + PostgreSQL)
//
// PHASE 1
// Setup:
//   1. Create a database named expense_tracker and run schema.sql on it.
//   2. Copy .env.example to a new file named .env and write your PostgreSQL password.
//   3. npm install express cors pg dotenv
//
// Run:
//   node server.js
//
// Endpoints:
//   GET    /api/expenses
//   GET    /api/expenses/:id
//   POST   /api/expenses
//   PUT    /api/expenses/:id
//   DELETE /api/expenses/:id

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const allowedCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other"
];


// GET /api/expenses
// Return all expenses
app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            ORDER BY id
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// GET /api/expenses/:id
// Return one expense
app.get("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    try {
        const result = await pool.query(
            `
            SELECT
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// POST /api/expenses
// Add a new expense
app.post("/api/expenses", async (req, res) => {
    const { title, amount, category, date } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            message: "Amount must be a number greater than 0"
        });
    }

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Category must be Food, Transport, Bills, Entertainment, or Other"
        });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
            message: "Date must be in YYYY-MM-DD format"
        });
    }

    try {
        const result = await pool.query(
            `
            INSERT INTO expenses (title, amount, category, date)
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            `,
            [title.trim(), amount, category, date]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// PUT /api/expenses/:id
// Update an expense
app.put("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    const { title, amount, category, date } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            message: "Amount must be a number greater than 0"
        });
    }

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Category must be Food, Transport, Bills, Entertainment, or Other"
        });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
            message: "Date must be in YYYY-MM-DD format"
        });
    }

    try {
        const result = await pool.query(
            `
            UPDATE expenses
            SET
                title = $1,
                amount = $2,
                category = $3,
                date = $4
            WHERE id = $5
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            `,
            [title.trim(), amount, category, date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// DELETE /api/expenses/:id
// Delete an expense
app.delete("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    try {
        const result = await pool.query(
            `
            DELETE FROM expenses
            WHERE id = $1
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully",
            expense: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});