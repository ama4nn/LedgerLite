import React from 'react';
import { Filter } from 'lucide-react';

export default function ExpenseFilters({ categories, selected, onChange }) {
  return (
    <div className="filters">
      <label htmlFor="category-filter"><Filter size={12} /> FILTER</label>
      <select
        id="category-filter"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}