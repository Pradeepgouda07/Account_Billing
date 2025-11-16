import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [form, setForm] = useState({
    client: {
      name: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      },
      taxId: "",
    },
    items: [{ description: "", quantity: 1, price: 0 }],
    discount: 0,
    discountType: "fixed",
    taxRate: 0,
    shipping: 0,
    dueDate: "",
    issueDate: new Date().toISOString().split("T")[0],
    paymentTerms: "Net 30",
    currency: "INR",
    notes: "",
    terms: "",
    reference: "",
    status: "draft",
  });
  const token = localStorage.getItem("token");

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      alert("Failed to load invoices");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
      0
    );
    let amountAfterDiscount = subtotal;
    if (form.discount > 0) {
      if (form.discountType === "percentage") {
        amountAfterDiscount = subtotal * (1 - form.discount / 100);
      } else {
        amountAfterDiscount = Math.max(0, subtotal - form.discount);
      }
    }
    const tax = amountAfterDiscount * ((form.taxRate || 0) / 100);
    const total = amountAfterDiscount + tax + (Number(form.shipping) || 0);
    return { subtotal, amountAfterDiscount, tax, total };
  };

  const totals = calculateTotals();

  // Reset form
  const resetForm = () => {
    setForm({
      client: {
        name: "",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
        },
        taxId: "",
      },
      items: [{ description: "", quantity: 1, price: 0 }],
      discount: 0,
      discountType: "fixed",
      taxRate: 0,
      shipping: 0,
      dueDate: "",
      issueDate: new Date().toISOString().split("T")[0],
      paymentTerms: "Net 30",
      currency: "INR",
      notes: "",
      terms: "",
      reference: "",
      status: "draft",
    });
    setEditingInvoice(null);
  };

  // Open modal for new invoice
  const handleNewInvoice = () => {
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setForm({
      client: invoice.client || {
        name: "",
        email: "",
        phone: "",
        address: {},
        taxId: "",
      },
      items: invoice.items || [{ description: "", quantity: 1, price: 0 }],
      discount: invoice.discount || 0,
      discountType: invoice.discountType || "fixed",
      taxRate: invoice.taxRate || 0,
      shipping: invoice.shipping || 0,
      dueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toISOString().split("T")[0]
        : "",
      issueDate: invoice.issueDate
        ? new Date(invoice.issueDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      paymentTerms: invoice.paymentTerms || "Net 30",
      currency: invoice.currency || "INR",
      notes: invoice.notes || "",
      terms: invoice.terms || "",
      reference: invoice.reference || "",
      status: invoice.status || "draft",
    });
    setShowModal(true);
  };

  // Add/Update invoice
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate client name
      if (!form.client || !form.client.name || form.client.name.trim() === "") {
        alert("Client name is required");
        return;
      }

      // Validate items - filter out empty items but keep valid ones
      const validItems = form.items.filter(
        (item) => 
          item.description && 
          item.description.trim() !== "" && 
          item.quantity !== undefined && 
          item.quantity > 0 && 
          item.price !== undefined && 
          item.price >= 0
      );

      if (validItems.length === 0) {
        alert("At least one item with description, quantity, and price is required");
        return;
      }

      // Validate due date
      if (!form.dueDate) {
        alert("Due date is required");
        return;
      }

      // Prepare payload
      const payload = {
        client: {
          name: form.client.name.trim(),
          email: form.client.email || "",
          phone: form.client.phone || "",
          address: form.client.address || {},
          taxId: form.client.taxId || "",
        },
        items: validItems.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        discount: form.discount ? Number(form.discount) : 0,
        discountType: form.discountType || "fixed",
        taxRate: form.taxRate ? Number(form.taxRate) : 0,
        shipping: form.shipping ? Number(form.shipping) : 0,
        dueDate: form.dueDate,
        issueDate: form.issueDate || new Date().toISOString().split("T")[0],
        paymentTerms: form.paymentTerms || "Net 30",
        currency: form.currency || "INR",
        notes: form.notes || "",
        terms: form.terms || "",
        reference: form.reference || "",
        status: form.status || "draft",
      };

      if (editingInvoice) {
        await axios.put(`${API_BASE}/invoices/${editingInvoice._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_BASE}/invoices`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      resetForm();
      fetchInvoices();
    } catch (err) {
      console.error("Error saving invoice:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.message || "Failed to save invoice";
      alert(errorMessage);
    }
  };

  // Delete invoice
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axios.delete(`${API_BASE}/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      console.error("Error deleting invoice:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to delete invoice");
    }
  };

  // Update payment
  const handlePayment = async (invoice) => {
    const amountPaid = prompt(
      `Enter amount paid (Total: ${invoice.total}, Already paid: ${invoice.amountPaid || 0})`
    );
    if (amountPaid === null) return;

    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      await axios.patch(
        `${API_BASE}/invoices/${invoice._id}/payment`,
        { amountPaid: paid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchInvoices();
    } catch (err) {
      console.error("Error updating payment:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update payment");
    }
  };

  // Update status
  const handleStatusChange = async (invoice, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE}/invoices/${invoice._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchInvoices();
    } catch (err) {
      console.error("Error updating status:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  // Add item row
  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: "", quantity: 1, price: 0 }],
    });
  };

  // Remove item row
  const removeItem = (index) => {
    if (form.items.length > 1) {
      setForm({
        ...form,
        items: form.items.filter((_, i) => i !== index),
      });
    }
  };

  // Update item
  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      draft: "secondary",
      sent: "info",
      viewed: "primary",
      paid: "success",
      overdue: "danger",
      cancelled: "dark",
      refunded: "warning",
    };
    return colors[status] || "secondary";
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "auto" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Invoices</h2>
        <button className="btn btn-primary" onClick={handleNewInvoice}>
          + New Invoice
        </button>
      </div>

      {/* Invoice Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1050,
            overflow: "auto",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            style={{ margin: "20px auto", maxWidth: "900px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              <div className="modal-header" style={{ flexShrink: 0 }}>
                <h5 className="modal-title">
                  {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div className="modal-body" style={{ overflowY: "auto", flex: "1 1 auto", maxHeight: "calc(90vh - 120px)" }}>
                  {/* Client Information */}
                  <div className="mb-3">
                    <h6 className="mb-2">Client Information</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small">Client Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={form.client.name}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              client: { ...form.client, name: e.target.value },
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Email</label>
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          value={form.client.email}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              client: { ...form.client, email: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Phone</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={form.client.phone}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              client: { ...form.client, phone: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Tax ID (GST/VAT)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={form.client.taxId}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              client: { ...form.client, taxId: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Items</h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={addItem}
                      >
                        + Add Item
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th style={{ width: "100px" }}>Qty</th>
                            <th style={{ width: "120px" }}>Price</th>
                            <th style={{ width: "120px" }}>Total</th>
                            <th style={{ width: "50px" }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.items.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateItem(index, "description", e.target.value)
                                  }
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(index, "quantity", e.target.value)
                                  }
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.price}
                                  onChange={(e) =>
                                    updateItem(index, "price", e.target.value)
                                  }
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </td>
                              <td>
                                {(
                                  (Number(item.quantity) || 0) *
                                  (Number(item.price) || 0)
                                ).toFixed(2)}
                              </td>
                              <td>
                                {form.items.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => removeItem(index)}
                                  >
                                    ×
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="row mb-3 g-2">
                    <div className="col-md-6">
                      <h6 className="mb-2">Financial Details</h6>
                      <div className="mb-2">
                        <label className="form-label small">Discount</label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            className="form-control"
                            value={form.discount}
                            onChange={(e) =>
                              setForm({ ...form, discount: e.target.value })
                            }
                            min="0"
                            step="0.01"
                          />
                          <select
                            className="form-select"
                            style={{ width: "100px" }}
                            value={form.discountType}
                            onChange={(e) =>
                              setForm({ ...form, discountType: e.target.value })
                            }
                          >
                            <option value="fixed">Fixed</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small">Tax Rate (%)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={form.taxRate}
                          onChange={(e) =>
                            setForm({ ...form, taxRate: e.target.value })
                          }
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small">Shipping</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={form.shipping}
                          onChange={(e) =>
                            setForm({ ...form, shipping: e.target.value })
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-2">Summary</h6>
                      <div className="border p-2 rounded" style={{ fontSize: "0.9rem" }}>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal:</span>
                          <span>₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        {form.discount > 0 && (
                          <div className="d-flex justify-content-between mb-2 text-muted">
                            <span>
                              Discount ({form.discountType === "percentage" ? `${form.discount}%` : "₹" + form.discount}):
                            </span>
                            <span>
                              -₹
                              {(
                                totals.subtotal - totals.amountAfterDiscount
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {form.taxRate > 0 && (
                          <div className="d-flex justify-content-between mb-2 text-muted">
                            <span>Tax ({form.taxRate}%):</span>
                            <span>₹{totals.tax.toFixed(2)}</span>
                          </div>
                        )}
                        {form.shipping > 0 && (
                          <div className="d-flex justify-content-between mb-2 text-muted">
                            <span>Shipping:</span>
                            <span>₹{Number(form.shipping).toFixed(2)}</span>
                          </div>
                        )}
                        <hr />
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total:</span>
                          <span>₹{totals.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates and Terms */}
                  <div className="row mb-3 g-2">
                    <div className="col-md-3">
                      <label className="form-label small">Issue Date *</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={form.issueDate}
                        onChange={(e) =>
                          setForm({ ...form, issueDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">Due Date *</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={form.dueDate}
                        onChange={(e) =>
                          setForm({ ...form, dueDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">Payment Terms</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.paymentTerms}
                        onChange={(e) =>
                          setForm({ ...form, paymentTerms: e.target.value })
                        }
                        placeholder="Net 30"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="viewed">Viewed</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Reference/PO Number</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.reference}
                        onChange={(e) =>
                          setForm({ ...form, reference: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-2">
                    <label className="form-label small">Notes</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingInvoice ? "Update" : "Create"} Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No invoices found. Click "New Invoice" to create one.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber || inv._id}</td>
                  <td>{inv.client?.name || "N/A"}</td>
                  <td>₹{inv.total?.toFixed(2) || "0.00"}</td>
                  <td>
                    <span
                      className={`badge bg-${getStatusColor(inv.status)}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <small>
                      Paid: ₹{inv.amountPaid?.toFixed(2) || "0.00"} / ₹
                      {inv.total?.toFixed(2) || "0.00"}
                      <br />
                      <span
                        className={`badge bg-${
                          inv.paymentStatus === "paid"
                            ? "success"
                            : inv.paymentStatus === "partial"
                            ? "warning"
                            : "secondary"
                        }`}
                      >
                        {inv.paymentStatus || "unpaid"}
                      </span>
                    </small>
                  </td>
                  <td>
                    {inv.issueDate
                      ? new Date(inv.issueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleEdit(inv)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-outline-success"
                        onClick={() => handlePayment(inv)}
                        title="Update Payment"
                      >
                        💰
                      </button>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: "auto" }}
                        value={inv.status}
                        onChange={(e) =>
                          handleStatusChange(inv, e.target.value)
                        }
                        title="Change Status"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="viewed">Viewed</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(inv._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
