const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const db = require('../db');

// ─── POST /expenses ────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'];

    // Return cached response for retries (same idempotency key)
    if (idempotencyKey) {
        const cached = db
            .prepare('SELECT * FROM idempotency_cache WHERE key = ?')
            .get(idempotencyKey);
        if (cached) {
            return res.status(cached.status_code).json(JSON.parse(cached.response));
        }
    }

    const { amount, category, description, date } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────────
    const errors = [];

    const parsedAmount = parseFloat(amount);
    if (amount === undefined || amount === null || amount === '') {
        errors.push('Amount is required.');
    } else if (isNaN(parsedAmount)) {
        errors.push('Amount must be a valid number.');
    } else if (parsedAmount <= 0) {
        errors.push('Amount must be greater than zero.');
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(amount).trim())) {
        errors.push('Amount must have at most 2 decimal places.');
    }

    if (!category || !category.trim()) errors.push('Category is required.');
    if (!description || !description.trim()) errors.push('Description is required.');
    if (!date) {
        errors.push('Date is required.');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push('Date must be in YYYY-MM-DD format.');
    }

    if (errors.length > 0) {
        const body = { errors };
        cacheResponse(idempotencyKey, 400, body);
        return res.status(400).json(body);
    }

    // ── Persist ─────────────────────────────────────────────────────────────────
    // Store as integer paise — Math.round avoids any float drift
    const amountInPaise = Math.round(parsedAmount * 100);
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    db.prepare(`
    INSERT INTO expenses (id, amount, category, description, date, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, amountInPaise, category.trim(), description.trim(), date, createdAt);

    const expense = formatExpense({ id, amount: amountInPaise, category: category.trim(), description: description.trim(), date, created_at: createdAt });
    const body = { expense };

    cacheResponse(idempotencyKey, 201, body);
    return res.status(201).json(body);
});

// ─── GET /expenses ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    const { category, sort } = req.query;

    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
    }

    // Sort logic
    if (sort === 'date_asc') {
        query += ' ORDER BY date ASC, created_at ASC';
    } else {
        // Default: newest first
        query += ' ORDER BY date DESC, created_at DESC';
    }

    const rows = db.prepare(query).all(...params);
    const expenses = rows.map(formatExpense);

    const totalInPaise = rows.reduce((sum, e) => sum + e.amount, 0);
    const total = totalInPaise / 100;

    const categories = db
        .prepare('SELECT DISTINCT category FROM expenses ORDER BY category ASC')
        .all()
        .map((r) => r.category);

    return res.json({ expenses, total, categories });
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatExpense(row) {
    return {
        id: row.id,
        amount: row.amount / 100,          // paise → rupees at the boundary
        category: row.category,
        description: row.description,
        date: row.date,
        created_at: row.created_at,
    };
}

function cacheResponse(key, statusCode, body) {
    if (!key) return;
    db.prepare(`
    INSERT OR IGNORE INTO idempotency_cache (key, status_code, response, created_at)
    VALUES (?, ?, ?, ?)
  `).run(key, statusCode, JSON.stringify(body), new Date().toISOString());
}

module.exports = router;