import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function Voucher() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState({
    name: "",
    paidAmount: "",
    comments: "",
    date: ""
  });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await api.get("/voucher", { params: { page } });
    setRows(res.data.data);
    setPages(res.data.pagination.pages);
  };

  useEffect(() => { load(); }, [page]);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.paidAmount || !form.date) {
      alert("Name, Amount and Date are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/voucher/${editingId}`, form);
      } else {
        await api.post("/voucher", form);
      }

      setForm({ name: "", paidAmount: "", comments: "", date: "" });
      setEditingId(null);
      load();
    } catch {
      alert("Failed to save voucher");
    }
  };

  const editRow = (r) => {
    setForm({
      name: r.name || "",
      paidAmount: r.paidAmount || "",
      comments: r.comments || "",
      date: r.date || ""
    });
    setEditingId(r.id);
  };

  const remove = async (id) => {
    if (!confirm("Delete this voucher?")) return;
    await api.delete(`/voucher/${id}`);
    load();
  };

  return (
    <Layout>
      <h4 className="mb-3">Voucher</h4>

      {/* FORM */}
      <form className="card p-3 mb-4" onSubmit={submit}>
        <div className="row g-2">
          <div className="col-12 col-md-3">
            <input
              className="form-control"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Amount"
              value={form.paidAmount}
              onChange={e => setForm({ ...form, paidAmount: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-3">
            <input
              className="form-control"
              placeholder="Comments"
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-2">
            <input
              type="date"
              className="form-control"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-2 d-grid">
            <button className="btn btn-primary">
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {/* LIST (Desktop) */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Comments</th>
              <th>Date</th>
              <th width="140">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>₹{r.paidAmount}</td>
                <td>{r.comments}</td>
                <td>{r.date}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => editRow(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => remove(r.id)}
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

      {/* Mobile Cards */}
      <div className="d-md-none">
        {rows.map(r => (
          <div key={r.id} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between mb-2">
              <b>{r.name}</b>
              <span className="badge bg-success">₹{r.paidAmount}</span>
            </div>
            <div className="small text-muted mb-1">{r.comments}</div>
            <div className="small text-muted mb-2">{r.date}</div>
            <div className="d-grid gap-2">
              <button
                className="btn btn-warning btn-sm"
                onClick={() => editRow(r)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => remove(r.id)}
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
        <span>{page} / {pages}</span>
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
