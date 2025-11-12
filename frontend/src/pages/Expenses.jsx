import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    date: "",
  });
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  // Add new expense
  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        `${API_BASE}/expenses`,
        { ...form, amount: Number(form.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses([res.data, ...expenses]);
      setForm({ title: "", amount: "", category: "", description: "", date: "" });
    } catch (err) {
      console.error("Error adding expense:", err.response?.data);
      setError(err.response?.data?.error || "Error adding expense");
    }
  };

  // Delete expense
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div>
      <h2>Expenses</h2>
      <form onSubmit={handleAdd} className="mb-3">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="form-control mb-2"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="form-control mb-2"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="form-control mb-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="form-control mb-2"
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="form-control mb-2"
        />
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary">Add Expense</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, i) => (
            <tr key={exp._id}>
              <td>{i + 1}</td>
              <td>{exp.title}</td>
              <td>{exp.category}</td>
              <td>{exp.amount}</td>
              <td>{exp.description}</td>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(exp._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
