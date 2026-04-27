import React from 'react';

export default function ExpenseFilters({ categories, selected, onChange }) {
  return (
    <div className="filters">
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