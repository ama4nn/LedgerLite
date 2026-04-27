import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

export default function ExpenseFilters({ 
  categories, 
  selected, 
  onChange, 
  sortSelected, 
  onSortChange 
}) {
  return (
    <div className="filters">
      <div className="filter-group">
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

      <div className="filter-group">
        <label htmlFor="sort-filter"><ArrowUpDown size={12} /> SORT</label>
        <select
          id="sort-filter"
          value={sortSelected}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
}