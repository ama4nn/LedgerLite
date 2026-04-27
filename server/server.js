const express = require('express');
const cors = require('cors');
const expensesRouter = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Allow all origins for easier deployment
app.use(express.json());

app.use('/expenses', expensesRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));