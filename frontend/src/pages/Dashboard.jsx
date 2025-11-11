// export default function Dashboard() {
//   return (
//     <div>
//       <h2>Dashboard</h2>
//       <p>Welcome to the Accounting ERP Dashboard.</p>
//     </div>
//   );
// }


import React from "react";
import "./Dashboard.css";

export default function Dashboard() {
  // Example dummy data (replace with real API data later)
  const stats = [
    { title: "Total Expenses", value: "$12,450", color: "#FF6B6B" },
    { title: "Total Payments", value: "$8,230", color: "#4ECDC4" },
    { title: "Invoices Issued", value: "125", color: "#FFD93D" },
    { title: "Reports Generated", value: "24", color: "#6A82FB" },
  ];

  return (
    <div className="dashboard-page">
      <h2>Welcome to Accounting ERP Dashboard</h2>
      <p className="dashboard-subtitle">Here’s a quick overview of your account</p>

      <div className="dashboard-cards">
        {stats.map((stat, idx) => (
          <div
            className="dashboard-card"
            key={idx}
            style={{ backgroundColor: stat.color }}
          >
            <h3>{stat.value}</h3>
            <p>{stat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
