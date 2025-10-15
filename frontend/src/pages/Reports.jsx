import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [monthYear, setMonthYear] = useState({ month: "", year: "" });

  const fetch = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${API_BASE}/reports/monthly?month=${monthYear.month}&year=${monthYear.year}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setReport(res.data);
  };

  return (
    <div>
      <h2>Monthly Report</h2>
      <div className="mb-3 d-flex">
        <input
          type="number"
          placeholder="Month (1-12)"
          className="form-control me-2"
          value={monthYear.month}
          onChange={(e) => setMonthYear({ ...monthYear, month: e.target.value })}
        />
        <input
          type="number"
          placeholder="Year (e.g. 2025)"
          className="form-control me-2"
          value={monthYear.year}
          onChange={(e) => setMonthYear({ ...monthYear, year: e.target.value })}
        />
        <button className="btn btn-primary" onClick={fetch}>
          Generate
        </button>
      </div>
      {report && (
        <div>
          <p>
            <strong>Revenue:</strong> ₹{report.revenue.toFixed(2)}
          </p>
          <p>
            <strong>Expenses:</strong> ₹{report.expense.toFixed(2)}
          </p>
          <p>
            <strong>Profit:</strong> ₹{report.profit.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}







