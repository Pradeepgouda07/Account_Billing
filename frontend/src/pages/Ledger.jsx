import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch ledger entries from backend
  const fetchLedger = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // if using auth
      const res = await axios.get("http://localhost:4000/api/ledger", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching ledger:", err);
      setError(err.response?.data?.error || "Failed to fetch ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Ledger</h3>
      {loading && <p>Loading ledger entries...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <table className="table table-striped table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
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
                <tr key={entry._id || entry.id}>
                  <td>{entry._id || entry.id}</td>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.description}</td>
                  <td>{entry.debit || 0}</td>
                  <td>{entry.credit || 0}</td>
                  <td>{entry.balance || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
