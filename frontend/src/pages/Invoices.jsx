import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Invoices() {
  const [list, setList] = useState([]);
  const [invForm, setInvForm] = useState({
    supplierId: "",
    dueDate: "",
    lines: [{ description: "", qty: 1, unitPrice: 0 }]
  });

  const fetch = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE}/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setList(res.data);
  };

  const addLine = () => {
    setInvForm({
      ...invForm,
      lines: [...invForm.lines, { description: "", qty: 1, unitPrice: 0 }]
    });
  };

  const handleLineChange = (idx, field, val) => {
    const newLines = [...invForm.lines];
    newLines[idx][field] = val;
    setInvForm({ ...invForm, lines: newLines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await axios.post(`${API_BASE}/invoices`, invForm, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setInvForm({
      supplierId: "",
      dueDate: "",
      lines: [{ description: "", qty: 1, unitPrice: 0 }]
    });
    fetch();
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div>
      <h2>Invoices</h2>
      <form className="mb-3" onSubmit={handleSubmit}>
        <div className="mb-2">
          <input
            className="form-control"
            type="date"
            value={invForm.dueDate}
            onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })}
          />
        </div>
        {invForm.lines.map((ln, idx) => (
          <div key={idx} className="d-flex mb-2">
            <input
              className="form-control me-2"
              placeholder="Desc"
              value={ln.description}
              onChange={(e) => handleLineChange(idx, "description", e.target.value)}
            />
            <input
              className="form-control me-2"
              type="number"
              placeholder="Qty"
              value={ln.qty}
              onChange={(e) => handleLineChange(idx, "qty", e.target.value)}
            />
            <input
              className="form-control me-2"
              type="number"
              placeholder="Unit Price"
              value={ln.unitPrice}
              onChange={(e) => handleLineChange(idx, "unitPrice", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="btn btn-secondary me-2" onClick={addLine}>
          + Line
        </button>
        <button className="btn btn-primary">Create Invoice</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>#</th><th>Total</th><th>Status</th><th>Due Date</th><th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {list.map((inv, i) => (
            <tr key={inv._id}>
              <td>{i + 1}</td>
              <td>{inv.totalAmount}</td>
              <td>{inv.status}</td>
              <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
              <td>
                <a
                  href={`${API_BASE}/invoices/${inv._id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
