import { useState, useRef } from 'react';
import { createExpense } from '../api';

const PRESET_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Health',
  'Utilities',
  'Entertainment',
  'Other',
];

export default function ExpenseForm({ onCreated }) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: getToday(),
  });

  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Idempotency key rotates ONLY on success
  const idempotencyKey = useRef(crypto.randomUUID());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear feedback when user starts typing again
    setErrors([]);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors([]);
    setSuccess(false);

    try {
      const amountNum = parseFloat(formData.amount);
      await createExpense(
        {
          ...formData,
          amount: amountNum,
        },
        idempotencyKey.current
      );

      // On success: clear fields, show message, rotate key, notify parent
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: getToday(),
      });
      setSuccess(true);
      idempotencyKey.current = crypto.randomUUID();
      
      if (onCreated) onCreated();
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setErrors(['Failed to create expense. Please check your connection.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      {success && <p className="success-msg">Expense created successfully!</p>}
      
      {errors.length > 0 && (
        <ul className="error-list">
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      )}

      <div className="form-row">
        <label htmlFor="amount">Amount (₹)</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={formData.amount}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          type="text"
          list="category-suggestions"
          required
          value={formData.category}
          onChange={handleChange}
        />
        <datalist id="category-suggestions">
          {PRESET_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>

      <div className="form-row">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          required
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}
