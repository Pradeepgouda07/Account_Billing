import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    debit: 0,
    credit: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Handle delete entry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/ledger/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchLedger(); // Refresh the list
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError(err.response?.data?.message || "Failed to delete entry");
    }
  };

  // Fetch ledger entries from backend
  const fetchLedger = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/ledger`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching ledger:", err);
      setError(err.response?.data?.message || "Failed to fetch ledger");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit new ledger entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/ledger`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData({ date: "", description: "", debit: 0, credit: 0 });
      fetchLedger(); // Refresh the list
    } catch (err) {
      console.error("Error adding entry:", err);
      setError(err.response?.data?.message || "Failed to add entry");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Ledger</h3>

      {/* Form to add new entry */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row">
          <div className="col-md-3">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3">
            <label>Description:</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-2">
            <label>Debit:</label>
            <input
              type="number"
              name="debit"
              value={formData.debit}
              onChange={handleChange}
              className="form-control"
              min="0"
            />
          </div>
          <div className="col-md-2">
            <label>Credit:</label>
            <input
              type="number"
              name="credit"
              value={formData.credit}
              onChange={handleChange}
              className="form-control"
              min="0"
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Entry"}
            </button>
          </div>
        </div>
      </form>

      {loading && <p>Loading ledger entries...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <table className="table table-striped table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No ledger entries found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry._id}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.description}</td>
                  <td>{entry.debit || 0}</td>
                  <td>{entry.credit || 0}</td>
                  <td>{entry.balance || 0}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(entry._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
