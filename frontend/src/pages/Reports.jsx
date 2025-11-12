import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Reports() {   // ✅ must be a default export
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [report, setReport] = useState(null);
  const token = localStorage.getItem("token");

  const fetchReport = async () => {
    if (!month || !year) {
      alert("Please select month and year");
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE}/reports/monthly?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data);
    } catch (err) {
      console.error("Error fetching report:", err);
      alert("Failed to load report");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Monthly Report</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Month (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Year (e.g. 2025)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={fetchReport} className="btn btn-primary">
          Generate
        </button>
      </div>

      {report && (
        <div>
          <h4>Report for {month}/{year}</h4>
          <table className="table">
            <tbody>
              <tr>
                <td><strong>Total Invoices</strong></td>
                <td>{report.totalInvoices}</td>
              </tr>
              <tr>
                <td><strong>Total Payments</strong></td>
                <td>{report.totalPayments}</td>
              </tr>
              <tr>
                <td><strong>Total Expenses</strong></td>
                <td>{report.totalExpenses}</td>
              </tr>
              <tr>
                <td><strong>Net Income</strong></td>
                <td>{report.netIncome}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
