# FENMO — Personal Expense Tracker

A full-stack personal expense tracker built for high reliability and financial correctness.

## Running Locally

To run the application locally, you will need to start both the backend server and the frontend development server.

### Backend
```bash
cd server
npm install
node server.js
```
- **URL**: [http://localhost:3001](http://localhost:3001)
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

### Frontend
```bash
cd client
npm install
npm run dev
```
- **URL**: [http://localhost:5173](http://localhost:5173)

---

## Stack

- **Backend**: Node.js, Express, `better-sqlite3` (SQLite)
- **Frontend**: React (Vite), Vanilla CSS
- **Database**: SQLite with WAL mode enabled

---

## Key Design Decisions

### 1. Money Stored as Integer Paise
To eliminate floating-point rounding bugs common in financial applications, all amounts are stored as integers (paise) in the database (e.g., ₹1.50 is stored as `150`). Conversion to rupees happens strictly at the API response boundary:
- **Incoming**: `Math.round(amount * 100)`
- **Outgoing**: `amount / 100`

### 2. Idempotency via Client-Generated UUID
The application implements "exactly-once" semantics for expense creation.
- The client generates a `crypto.randomUUID()` for each form session and sends it in the `Idempotency-Key` header.
- The server caches responses in an `idempotency_cache` table.
- Retries (caused by network failure, double-clicks, or page refreshes) return the cached response instead of creating duplicate records.
- The key rotates only after a successful 201 Created response.

### 3. SQLite with better-sqlite3
We chose SQLite for its zero-config, file-based nature. The `better-sqlite3` library provides a high-performance synchronous API which is ideal for this scale. In a multi-instance production environment, this would be swapped for a database like PostgreSQL.

### 4. Server-Side Sorting Only
Expenses are always returned in `date DESC, created_at DESC` order directly from the database. The frontend maintains no sorting state, reducing complexity and ensuring consistency across sessions.

---

## Trade-offs Made for the Timebox

- **No Auth**: Single shared store without user scoping or JWT authentication.
- **Cache Management**: The idempotency cache is currently persistent and never pruned.
- **No Pagination**: The API returns the full list of expenses; suitable for personal use but would require pagination for larger datasets.
- **No ORM**: Raw SQL is used for maximum clarity and control over performance and schema.

---

## What I Intentionally Did Not Do

- **No UI Component Library**: Used Vanilla CSS to keep the bundle size small and avoid unnecessary dependency bloat.
- **No Client-Side Sort State**: Delegated sorting entirely to the server to maintain a single source of truth.
- **No Automated Tests**: While the architecture is testable, automated suites were omitted in favor of manual verification within the time constraints.
