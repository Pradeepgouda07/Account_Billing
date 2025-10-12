import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      className="bg-light border-end vh-100"
      style={{ width: "200px" }}
    >
      <ul className="list-unstyled p-3">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/expenses">Expenses</Link>
        </li>
        <li>
          <Link to="/payments">Payments</Link>
        </li>
        <li>
          <Link to="/invoices">Invoices</Link>
        </li>
        <li>
          <Link to="/reports">Reports</Link>
        </li>
      </ul>
    </div>
  );
}
