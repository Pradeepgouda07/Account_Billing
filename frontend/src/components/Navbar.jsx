// import React from "react";

// export default function Navbar() {
//   return (
//     <nav className="navbar navbar-dark bg-dark px-3">
//       <span className="navbar-brand mb-0 h1 text-white">Accounting ERP</span>
//     </nav>
//   );
// }




import React from "react";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{
        background: "linear-gradient(90deg, #1aead9ff, #1fbae4ff)",
        padding: "0.75rem 1.5rem",
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Brand */}
        <span className="navbar-brand mb-0 h1 text-white fw-bold">
          <i className="bi bi-calculator-fill me-2"></i> Accounting ERP
        </span>

        {/* Right Side */}
        <div className="d-flex align-items-center">
          <span className="text-white me-3 small">Welcome, Admin</span>
          <FaUserCircle className="text-white fs-4" />
        </div>
      </div>
    </nav>
  );
}
