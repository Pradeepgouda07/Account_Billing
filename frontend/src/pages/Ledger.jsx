import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/ledger`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Backend may return { entries: [...] } or array directly
        setEntries(Array.isArray(res.data.entries) ? res.data.entries : res.data || []);
      } catch (err) {
        console.error("Error fetching ledger:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Loading ledger...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">Ledger Entries</h2>
      <div className="overflow-x-auto shadow rounded-lg bg-white">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Debit Account</th>
              <th className="px-4 py-2 text-left">Credit Account</th>
              <th className="px-4 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No ledger entries found.
                </td>
              </tr>
            ) : (
              entries.map((entry, i) => (
                <tr key={entry._id || i} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{entry.description}</td>
                  <td className="px-4 py-2">{entry.debitAccount}</td>
                  <td className="px-4 py-2">{entry.creditAccount}</td>
                  <td className="px-4 py-2 font-medium text-green-600">₹{entry.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
