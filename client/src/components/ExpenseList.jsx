import React from 'react';

export default function ExpenseList({ expenses }) {
  if (expenses.length === 0) {
    return <p className="state-msg">No expenses found.</p>;
  }

  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th className="amount-col">Amount</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id}>
            <td>{expense.date}</td>
            <td>
              <span className="badge">{expense.category}</span>
            </td>
            <td>{expense.description}</td>
            <td className="amount-col">₹{expense.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}