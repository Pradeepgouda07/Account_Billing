import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

export default function Reports() {
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

  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Monthly Report - ${month}/${year}`, 14, 22);

    const tableColumn = ["Description", "Amount"];
    const tableRows = [
      ["Total Invoices", report.totalInvoices],
      ["Total Payments", report.totalPayments],
      ["Total Expenses", report.totalExpenses],
      ["Net Income", report.netIncome],
    ];

    // ✅ Correct way to use autoTable
    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save(`report_${month}_${year}.pdf`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Monthly Report</h2>

      <div style={{ marginBottom: "20px" }}>
       <select
  value={month}
  onChange={(e) => setMonth(e.target.value)}
  style={{ marginRight: "10px" }}
>
  <option value="">Select Month</option>
  <option value="1">January</option>
  <option value="2">February</option>
  <option value="3">March</option>
  <option value="4">April</option>
  <option value="5">May</option>
  <option value="6">June</option>
  <option value="7">July</option>
  <option value="8">August</option>
  <option value="9">September</option>
  <option value="10">October</option>
  <option value="11">November</option>
  <option value="12">December</option>
</select>

        
        <input
          type="number"
          placeholder="Year (e.g. 2025)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={fetchReport} className="btn btn-primary" style={{ marginRight: "10px" }}>
          Generate
        </button>
        {report && (
          <button onClick={downloadPDF} className="btn btn-success">
            Download PDF
          </button>
        )}
      </div>

      {report && (
        <div>
          <h4>
            Report for {month}/{year}
          </h4>
          <table className="table">
            <tbody>
              <tr>
                <td>
                  <strong>Total Invoices</strong>
                </td>
                <td>{report.totalInvoices}</td>
              </tr>
              <tr>
                <td>
                  <strong>Total Payments</strong>
                </td>
                <td>{report.totalPayments}</td>
              </tr>
              <tr>
                <td>
                  <strong>Total Expenses</strong>
                </td>
                <td>{report.totalExpenses}</td>
              </tr>
              <tr>
                <td>
                  <strong>Net Income</strong>
                </td>
                <td>{report.netIncome}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { API_BASE } from "../api";

// export default function Reports() {
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role");

//   useEffect(() => {
//     fetchProfitLoss();
//   }, []);

//   const fetchProfitLoss = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/reports/profit-loss`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSummary(res.data);
//     } catch (err) {
//       console.error("Error loading report:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <h4>Loading...</h4>;

//   return (
//     <div className="container mt-3">
//       <h2 className="mb-4">Profit / Loss Summary</h2>

//       <div className="card p-3 shadow">
//         <h5>Total Income: ₹{summary?.income || 0}</h5>
//         <h5>Total Expenses: ₹{summary?.expenses || 0}</h5>

//         <hr />

//         <h4 className={summary?.profit >= 0 ? "text-success" : "text-danger"}>
//           {summary?.profit >= 0 ? "Net Profit" : "Net Loss"}: ₹{summary?.profit}
//         </h4>
//       </div>
//     </div>
//   );
// }

