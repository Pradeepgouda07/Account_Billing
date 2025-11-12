import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ clientName: "", amount: "", description: "" });
  const token = localStorage.getItem("token");

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      alert("Failed to load invoices");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Add invoice
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE}/invoices`,
        { ...form, amount: Number(form.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ clientName: "", amount: "", description: "" });
      fetchInvoices();
    } catch (err) {
      console.error("Error adding invoice:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to add invoice");
    }
  };

  // Delete invoice
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axios.delete(`${API_BASE}/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      console.error("Error deleting invoice:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to delete invoice");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Invoices</h2>

      <form onSubmit={handleAdd} className="d-flex mb-3">
        <input
          type="text"
          placeholder="Client Name"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          required
          className="form-control me-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
          className="form-control me-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="form-control me-2"
        />
        <button type="submit" className="btn btn-success">
          Add
        </button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No invoices found
              </td>
            </tr>
          ) : (
            invoices.map((inv, i) => (
              <tr key={inv._id}>
                <td>{i + 1}</td>
                <td>{inv.clientName}</td>
                <td>{inv.amount}</td>
                <td>{inv.description || "-"}</td>
                <td>{new Date(inv.date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(inv._id)}
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
