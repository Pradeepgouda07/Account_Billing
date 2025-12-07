import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaWallet,
  FaMoneyBillWave,
  FaFileInvoice,
  FaChartLine,
  FaBook,
  FaUserShield,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem("role"); // admin / accountant / user

  let navItems = [];

  if (role === "admin") {
    // ------- ADMIN MENU -------
    navItems = [
      { name: "Dashboard", path: "/", icon: <FaTachometerAlt /> },

      // Admin Panel
      { name: "Admin Panel", path: "/admin", icon: <FaUserShield /> },
    ];
  } else {
    // ------- USER / ACCOUNTANT MENU -------
    navItems = [
      { name: "Dashboard", path: "/", icon: <FaTachometerAlt /> },
      { name: "Expenses", path: "/expenses", icon: <FaWallet /> },
      { name: "Payments", path: "/payments", icon: <FaMoneyBillWave /> },
      { name: "Invoices", path: "/invoices", icon: <FaFileInvoice /> },
      { name: "Ledger", path: "/ledger", icon: <FaBook /> },
      { name: "Reports", path: "/reports", icon: <FaChartLine /> },
      // Accountant & Admin view Reports, but NOT admin panel
      ...(role === "accountant"
        ? [{ name: "Reports", path: "/reports", icon: <FaChartLine /> }]
        : []),
    ];
  }

  return (
    <div
      className="d-flex flex-column justify-content-between bg-dark text-white border-end shadow-sm"
      style={{ width: "220px", height: "100vh" }}
    >
      {/* Header */}
      <div>
        <div className="px-3 py-3 border-bottom border-secondary">
          <h4 className="mb-0 fw-bold text-center text-info">Overview</h4>
          <p className="text-center text-secondary small mb-0">
            Accounting System
          </p>
        </div>

        {/* Navigation */}
        <ul className="list-unstyled p-3 mt-2">
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                to={item.path}
                className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none ${
                  location.pathname === item.path
                    ? "bg-info text-dark fw-bold"
                    : "text-white hover-opacity"
                }`}
                style={{ transition: "all 0.2s ease-in-out" }}
              >
                <span className="fs-5">{item.icon}</span>
                <span className="fs-6">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-top border-secondary">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <style>{`
        .hover-opacity:hover {
          background-color: rgba(255,255,255,0.1);
          color: #0dcaf0;
        }
      `}</style>
    </div>
  );
}
