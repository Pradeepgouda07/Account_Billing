import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../api";
import "./Signup.css";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "", adminKey: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
      };
      // Only include adminKey if provided
      if (form.adminKey) {
        payload.adminKey = form.adminKey;
      }
      
      const res = await axios.post(`${API_BASE}/auth/signup`, payload);
      localStorage.setItem("token", res.data.token);
      // Store role for role-based access control
      if (res.data.user?.role) {
        localStorage.setItem("role", res.data.user.role);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Sign up to get started</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="signup-input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email (Optional)"
            className="signup-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="signup-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Admin Key (Optional - for admin access)"
            className="signup-input"
            value={form.adminKey}
            onChange={(e) => setForm({ ...form, adminKey: e.target.value })}
          />
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>
        <div className="signup-footer">
          <span>Already have an account? </span>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
