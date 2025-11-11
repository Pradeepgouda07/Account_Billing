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




// import React, { useState } from "react";
// import { FaUserCircle } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import * as jwt_decode from "jwt-decode"; // ✅ Fixed for Vite
// import "./Navbar.css";

// export default function Navbar() {
//   const [dropdown, setDropdown] = useState(false);
//   const navigate = useNavigate();

//   // Get token and decode username
//   const token = localStorage.getItem("token");
//   let username = "User";

//   if (token) {
//     try {
//       const decoded = jwt_decode(token); // ✅ Use import * as jwt_decode
//       username = decoded.name || decoded.username || "User";
//     } catch (err) {
//       console.error("Invalid token", err);
//     }
//   }

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <nav className="navbar-custom">
//       <div className="navbar-container">
//         {/* Brand */}
//         <span className="navbar-brand">
//           <i className="bi bi-calculator-fill me-2"></i> Accounting ERP
//         </span>

//         {/* Right side */}
//         <div className="navbar-right">
//           <span className="welcome-text">Welcome, {username}</span>
//           <div
//             className="user-icon-wrapper"
//             onMouseEnter={() => setDropdown(true)}
//             onMouseLeave={() => setDropdown(false)}
//           >
//             <FaUserCircle className="user-icon" />

//             {dropdown && (
//               <div className="user-dropdown">
//                 <button onClick={() => navigate("/profile")}>Profile</button>
//                 <button onClick={handleLogout}>Logout</button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }
