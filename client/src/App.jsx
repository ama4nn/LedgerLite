import { useState, useEffect, useCallback } from 'react';
import { Wallet, PlusCircle, LayoutList } from 'lucide-react';
import { getExpenses } from './api';
import ExpenseForm from './components/ExpenseForm';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseList from './components/ExpenseList';
import './App.css';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async (category = selectedCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses({ category });
      setExpenses(data.expenses);
      setTotal(data.total);
      setCategories(data.categories);
    } catch (err) {
      setError('Could not load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchExpenses(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
  };

  const handleExpenseCreated = () => {
    fetchExpenses(selectedCategory);
  };

  return (
    <div className="app">
      <main className="app-main">
        <aside className="sidebar">
          <header className="app-header">
            <h1>LedgerLite</h1>
            <span className="subtitle">BUILT FOR FENMO</span>
          </header>

          <section className="form-section">
            <ExpenseForm onCreated={handleExpenseCreated} />
          </section>
        </aside>

        <section className="list-section">
          <div className="list-header">
            <h2><LayoutList size={14} /> recent entries</h2>
            <ExpenseFilters
              categories={categories}
              selected={selectedCategory}
              onChange={handleCategoryChange}
            />
          </div>

          {loading && <p className="state-msg">Loading…</p>}
          {error && <p className="state-msg error">{error}</p>}
          {!loading && !error && (
            <>
              <ExpenseList expenses={expenses} />
              <div className="total-bar">
                <strong>₹{total.toFixed(2)}</strong>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}