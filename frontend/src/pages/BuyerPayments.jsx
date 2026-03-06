import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function BuyerPayments() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState({
    buyerName: "",
    paidAmount: "",
    comments: "",
    billImage: "",
    date: ""
  });

  const load = async () => {
    const res = await api.get("/buyer-payments", { params: { page } });
    setRows(res.data.data);
    setPages(res.data.pagination.pages);
  };

  useEffect(() => { load(); }, [page]);

  const submit = async e => {
    e.preventDefault();
    await api.post("/buyer-payments", form);
    setForm({ buyerName: "", paidAmount: "", comments: "", billImage: "", date: "" });
    load();
  };

  return (
    <Layout>
      <h4 className="mb-3">Buyer Payments</h4>

      <form className="card p-3 mb-3" onSubmit={submit}>
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <input className="form-control" placeholder="Buyer Name"
              value={form.buyerName}
              onChange={e => setForm({ ...form, buyerName: e.target.value })} />
          </div>
          <div className="col-12 col-md-3">
            <input className="form-control" placeholder="Amount"
              value={form.paidAmount}
              onChange={e => setForm({ ...form, paidAmount: e.target.value })} />
          </div>
          <div className="col-12 col-md-3">
            <input type="date" className="form-control"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="col-12">
            <input type="file" className="form-control"
              onChange={e => setForm({ ...form, billImage: e.target.files[0] })} />
          </div>
          <div className="col-12">
            <textarea className="form-control" placeholder="Comments"
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })} />
          </div>
          <div className="col-12 d-grid">
            <button className="btn btn-success">Save</button>
          </div>
        </div>
      </form>

      {/* Desktop Table */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered">
          <thead><tr><th>Name</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.buyerName}</td>
                <td>₹{r.paidAmount}</td>
                <td>{r.date}</td>
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
              <b>{r.buyerName}</b>
              <span className="badge bg-success">₹{r.paidAmount}</span>
            </div>
            <div className="small text-muted">{r.date}</div>
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
