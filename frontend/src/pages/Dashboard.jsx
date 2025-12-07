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
        const role = localStorage.getItem("role");

        const endpoint =
          role === "admin"
            ? "http://localhost:4000/api/dashboard/admin-summary"
            : "http://localhost:4000/api/dashboard";

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        if (role === "admin") {
          const status = data.netProfit >= 0 ? "Profit" : "Loss";
          setStats([
    
            { title: "Total Expenses", value: `₹${data.totalExpenses}`, color: "#FF6B6B" },
            { title: "Total Payments", value: `₹${data.totalPayments}`, color: "#4ECDC4" },
            // { title: "Net Profit / Loss", value: `₹${data.netProfit}`, color: data.netProfit >= 0 ? "#2ECC71" : "#E74C3C" },
            {
      title: "Profit / Loss",
      value: `₹${data.netProfit} (${status})`,
      color: data.netProfit >= 0 ? "#2ECC71" : "#E74C3C"
    }
      
          ]);
        } else {
          setStats([
            { title: "Total Expenses", value: `₹${data.totalExpenses}`, color: "#FF6B6B" },
            { title: "Total Payments", value: `₹${data.totalPayments}`, color: "#4ECDC4" },
            { title: "Invoices Issued", value: data.invoicesCount, color: "#FFD93D" },
            { title: "Reports Generated", value: data.reportsCount, color: "#6A82FB" },
          ]);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard stats.");
      }
    };

    fetchDashboard();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>

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


