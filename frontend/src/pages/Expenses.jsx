import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Expenses() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ category: "", amount: "", description: "" });

  const fetch = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE}/expenses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setList(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await axios.post(`${API_BASE}/expenses`, form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setForm({ category: "", amount: "", description: "" });
    fetch();
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div>
      <h2>Expenses</h2>
      <form className="d-flex mb-3" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Category"
          className="form-control me-2"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount"
          className="form-control me-2"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          className="form-control me-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="btn btn-success">Add</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>#</th><th>Category</th><th>Amount</th><th>Description</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {list.map((ex, i) => (
            <tr key={ex._id}>
              <td>{i + 1}</td>
              <td>{ex.category}</td>
              <td>{ex.amount}</td>
              <td>{ex.description}</td>
              <td>{new Date(ex.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
