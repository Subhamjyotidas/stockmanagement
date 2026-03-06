import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState({ name: "", mobileNo: "", address: "" });
  const [editingId, setEditingId] = useState(null);
  const loadCustomers = async () => {
    const res = await api.get("/customers", { params: { page } });
    setCustomers(res.data.data);
    setPages(res.data.pagination.pages);
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);


  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      mobileNo: form.mobileNo.trim(),
      address: form.address.trim()
    };

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
      } else {
        await api.post("/customers", payload);
      }

      setForm({ name: "", mobileNo: "", address: "" });
      setEditingId(null);
      loadCustomers();
    } catch (err) {
      alert("Failed to save customer");
    }
  };

  const editCustomer = (c) => {
    setForm({
      name: c.name || "",
      mobileNo: c.mobileNo || "",
      address: c.address || ""
    });
    setEditingId(c.id);
  };

  const deleteCustomer = async (id) => {
    if (confirm("Delete this customer?")) {
      await api.delete(`/customers/${id}`);
      loadCustomers();
    }
  };

  return (
    <Layout>
      <h4 className="mb-3">Customers</h4>

      {/* ================= FORM ================= */}
      <form className="card p-3 mb-4" onSubmit={submit}>
        <div className="row g-2">
          <div className="col-12 col-md-4">
            <input
              className="form-control"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <input
              className="form-control"
              placeholder="Mobile"
              value={form.mobileNo}
              onChange={(e) =>
                setForm({ ...form, mobileNo: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-md-4">
            <input
              className="form-control"
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row gap-2 mt-3">
          <button className="btn btn-primary">
            {editingId ? "Update Customer" : "Add Customer"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setForm({ name: "", mobileNo: "", address: "" });
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ================= TABLE (Desktop) ================= */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Address</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.mobileNo}</td>
                <td>{c.address}</td>
                <td>
                  <div className="d-flex flex-column flex-md-row gap-1">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => editCustomer(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteCustomer(c.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="d-md-none">
        {customers.map((c) => (
          <div key={c.id} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between mb-2">
              <b>{c.name}</b>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Mobile:</span>
              <span>{c.mobileNo}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Address:</span>
              <span>{c.address}</span>
            </div>
            <div className="d-grid gap-2">
              <button
                className="btn btn-warning btn-sm"
                onClick={() => editCustomer(c)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteCustomer(c.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-sm btn-secondary"
          disabled={page <= 1}
          onClick={() => setPage(p => p - 1)}
        >
          Prev
        </button>

        <span>Page {page} of {pages}</span>

        <button
          className="btn btn-sm btn-secondary"
          disabled={page >= pages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>

    </Layout>
  );
}
