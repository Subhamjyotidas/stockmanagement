import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function PaymentHistory() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payment-history/history", {
        params: { from, to }
      });
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load payment history");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openInvoice = async (orderId) => {
    const res = await api.get(`/order-payments/${orderId}`);
    console.log(res.data);
    setInvoiceData(res.data);
    setShowInvoice(true);
  };

  return (
    <Layout>
      <h4 className="mb-3">Payment History</h4>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-3">
          <input
            type="date"
            className="form-control"
            value={from}
            onChange={e => setFrom(e.target.value)}
            placeholder="From"
          />
        </div>
        <div className="col-6 col-md-3">
          <input
            type="date"
            className="form-control"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="To"
          />
        </div>
        <div className="col-12 col-md-2 d-grid">
          <button className="btn btn-primary" onClick={load}>
            Search
          </button>
        </div>
      </div>

      {/* List (Desktop) */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Bill</th>
              <th>Customer</th>
              <th>BillingAmount</th>
              <th>Paid Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  {loading ? "Loading..." : "No records"}
                </td>
              </tr>
            )}

            {rows.map((r, idx) => (
              <tr key={`${r.id}-${idx}`}>
                <td>{r.billDate}</td>
                <td>{r.billNo}</td>
                <td>{r.customer?.name}</td>
                <td>₹{r.totalAmount}</td>
                <td>
                  ₹{r.paidAmount}
                </td>
                <td>
                  <span className={`badge ${
                    r.paymentStatus === "paid"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  }`}>
                    {r.paymentStatus}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-info" onClick={() => openInvoice(r.id)}>Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="d-md-none">
        {rows.length === 0 && (
          <div className="text-center text-muted py-4">
            {loading ? "Loading..." : "No records"}
          </div>
        )}
        {rows.map((r, idx) => (
          <div key={`${r.id}-${idx}`} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between mb-1">
              <b>{r.billNo}</b>
              <span className={`badge ${
                r.paymentStatus === "paid"
                  ? "bg-success"
                  : "bg-warning text-dark"
              }`}>
                {r.paymentStatus}
              </span>
            </div>
            <div className="small text-muted mb-1">{r.customer?.name}</div>
            <div className="d-flex justify-content-between mb-1">
              <span>Date:</span>
              <span>{r.billDate}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span>Total:</span>
              <b>₹{r.totalAmount}</b>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Paid:</span>
              <b>₹{r.paidAmount}</b>
            </div>
            <button className="btn btn-info btn-sm w-100" onClick={() => openInvoice(r.id)}>Invoice</button>
          </div>
        ))}
      </div>

      {/* INVOICE MODAL */}
      {showInvoice && invoiceData && (
        <div className="modal show d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog modal-lg modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                {invoiceData.length > 0 && (
                  <h5 className="mb-3">Bill No: {invoiceData[0].billNo}</h5>
                )}
                
                <button className="btn-close" onClick={() => setShowInvoice(false)} />
              </div>

              <div className="modal-body">


                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Discount</th>
                      <th>Payment Date</th>
                      <th>Payment Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.map(p => (
                      <tr key={p.id}>
                        
                        <td>₹{p.amount}</td>
                        <td>₹{p.discountAmount}</td>
                        <td>{p.paidOn}</td>
                        <td>{p.paymentMode}</td>
                      </tr>
                    ))}
                    
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
