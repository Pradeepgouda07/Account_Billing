// import React from "react";
// import "./Dashboard.css";

// export default function Dashboard() {
//   // Example dummy data (replace with real API data later)
//   const stats = [
//     { title: "Total Expenses", value: "$12,450", color: "#FF6B6B" },
//     { title: "Total Payments", value: "$8,230", color: "#4ECDC4" },
//     { title: "Invoices Issued", value: "125", color: "#FFD93D" },
//     { title: "Reports Generated", value: "24", color: "#6A82FB" },
//   ];

//   return (
//     <div className="dashboard-page">
//       <h2>Welcome to Accounting ERP Dashboard</h2>
//       <p className="dashboard-subtitle">Here’s a quick overview of your account</p>

//       <div className="dashboard-cards">
//         {stats.map((stat, idx) => (
//           <div
//             className="dashboard-card"
//             key={idx}
//             style={{ backgroundColor: stat.color }}
//           >
//             <h3>{stat.value}</h3>
//             <p>{stat.title}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }







import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setStats([
          { title: "Total Expenses", value: `$${data.totalExpenses}`, color: "#FF6B6B" },
          { title: "Total Payments", value: `$${data.totalPayments}`, color: "#4ECDC4" },
          { title: "Invoices Issued", value: data.invoicesCount, color: "#FFD93D" },
          { title: "Reports Generated", value: data.reportsCount, color: "#6A82FB" },
        ]);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err.response?.data || err.message);
        setError("Failed to load dashboard stats.");
      }
    };

    fetchDashboard();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-page">
      <h2>Welcome to Accounting ERP Dashboard</h2>
      <p className="dashboard-subtitle">Here’s a quick overview of your account</p>

      <div className="dashboard-cards">
        {stats.map((stat, idx) => (
          <div className="dashboard-card" key={idx} style={{ backgroundColor: stat.color }}>
            <h3>{stat.value}</h3>
            <p>{stat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
