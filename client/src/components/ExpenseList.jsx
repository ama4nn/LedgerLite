import React from 'react';

export default function ExpenseList({ expenses }) {
  if (expenses.length === 0) {
    return <p className="state-msg">no records found</p>;
  }

  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>date</th>
          <th>category</th>
          <th>description</th>
          <th className="amount-col">amount</th>
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