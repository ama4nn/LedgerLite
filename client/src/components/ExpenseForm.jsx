import { useState, useRef } from 'react';
import { CheckCircle, AlertCircle, Plus } from 'lucide-react';
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
  const [showCategories, setShowCategories] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Idempotency key rotates ONLY on success
  const idempotencyKey = useRef(crypto.randomUUID());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear feedback when user starts typing again
    setErrors([]);
    setSuccess(false);
  };

  const handleKeyDown = (e) => {
    if (!showCategories) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < PRESET_CATEGORIES.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : PRESET_CATEGORIES.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      setFormData((prev) => ({ ...prev, category: PRESET_CATEGORIES[activeIndex] }));
      setShowCategories(false);
      setActiveIndex(-1);
    }
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
      
      {errors.length > 0 && (
        <ul className="error-list">
          {errors.map((error, idx) => (
            <li key={idx}><AlertCircle size={14} /> {error}</li>
          ))}
        </ul>
      )}

      <div className="form-row">
        <label htmlFor="amount">amount (₹)</label>
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

      <div className="form-row" style={{ position: 'relative' }}>
        <label htmlFor="category">category</label>
        <input
          id="category"
          name="category"
          type="text"
          required
          readOnly
          placeholder="Select category"
          value={formData.category}
          onFocus={() => {
            setShowCategories(true);
            setActiveIndex(-1);
          }}
          onBlur={() => {
            setTimeout(() => {
              setShowCategories(false);
              setActiveIndex(-1);
            }, 200);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          style={{ cursor: 'pointer' }}
        />
        {showCategories && (
          <ul className="category-dropdown">
            {PRESET_CATEGORIES.map((cat, idx) => (
              <li
                key={cat}
                className={idx === activeIndex ? 'active' : ''}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, category: cat }));
                  setShowCategories(false);
                  setErrors([]);
                }}
              >
                {cat}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="description">description</label>
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
        <label htmlFor="date">date</label>
        <input
          id="date"
          name="date"
          type="date"
          required
          max={getToday()}
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'recording...' : <><Plus size={16} /> add entry</>}
      </button>

      {success && <p className="success-msg"><CheckCircle size={14} /> Entry recorded</p>}
    </form>
  );
}
