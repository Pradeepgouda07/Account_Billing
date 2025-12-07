import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ amount: "", description: "" });
  const token = localStorage.getItem("token");

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Add payment
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/payments`,
        { ...form, amount: Number(form.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ amount: "", description: "" });
      fetchPayments();
    } catch (err) {
      console.error("Error adding payment:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to add payment");
    }
  };

  // Delete payment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      await axios.delete(`${API_BASE}/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting payment:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to delete payment");
    }
  };

  return (
    <div>
      <h2>Payments</h2>

      <form onSubmit={handleAdd} className="d-flex mb-3 gap-3">
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

         <input
    type="date"
    value={form.date || ""}
    onChange={(e) => setForm({ ...form, date: e.target.value })}
    className="form-control"
    required
  />
        <button type="submit" className="btn btn-success">
          Add
        </button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No payments found
              </td>
            </tr>
          ) : (
            payments.map((p, i) => (
              <tr key={p._id}>
                <td>{i + 1}</td>
                <td>{p.amount}</td>
                <td>{p.description}</td>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
