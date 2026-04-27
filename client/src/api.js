const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getExpenses({ category } = {}) {
    const params = new URLSearchParams({ sort: 'date_desc' });
    if (category && category !== 'all') params.set('category', category);

    const res = await fetch(`${BASE_URL}/expenses?${params}`);
    if (!res.ok) throw new Error('Failed to load expenses.');
    return res.json(); // { expenses, total, categories }
}

export async function createExpense(data, idempotencyKey) {
    const res = await fetch(`${BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
        const err = new Error('Validation failed.');
        err.validationErrors = json.errors || [];
        throw err;
    }
    return json; // { expense }
}