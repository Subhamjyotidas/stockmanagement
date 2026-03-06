import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function OrderedItemHistory() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await api.get("/items");
        setItems(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load items");
      }
    };

    loadItems();
  }, []);

  const loadHistory = async (itemId) => {
    if (!itemId) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/item-history/${itemId}`);
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load ordered item history");
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Layout>
      <h4 className="mb-3">Ordered item history</h4>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <Select
            placeholder="Select Item"
            options={items.map(i => ({
              value: i.id,
              label: i.name
            }))}
            value={
              selectedItem
                ? {
                    value: selectedItem.id,
                    label: selectedItem.name
                  }
                : null
            }
            onChange={opt => {
              const item = opt
                ? { id: opt.value, name: opt.label }
                : null;
              setSelectedItem(item);
              if (item) {
                loadHistory(item.id);
              } else {
                setRows([]);
              }
            }}
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Bill</th>
              <th>Customer</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  {loading
                    ? "Loading..."
                    : selectedItem
                    ? "No records for this item"
                    : "Select an item to view history"}
                </td>
              </tr>
            )}

            {rows.map((r, idx) => (
              <tr key={`${r.orderId}-${idx}`}>
                <td>{formatDate(r.billDate)}</td>
                <td>{r.billNo}</td>
                <td>{r.customerName}</td>
                <td>{r.qty}</td>
                <td>₹{r.sellingPrice}</td>
                <td>₹{r.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="d-md-none">
        {rows.length === 0 && (
          <div className="text-center text-muted py-4">
            {loading
              ? "Loading..."
              : selectedItem
              ? "No records for this item"
              : "Select an item to view history"}
          </div>
        )}
        {rows.map((r, idx) => (
          <div key={`${r.orderId}-${idx}`} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between mb-1">
              <b>Invoice: {r.billNo}</b>
              <span>{formatDate(r.billDate)}</span>
            </div>
            <div className="small text-muted mb-2">{r.customerName}</div>
            <div className="d-flex justify-content-between">
              <span>Qty × Price</span>
              <span>{r.qty} × ₹{r.sellingPrice}</span>
            </div>
            <div className="d-flex justify-content-between mt-1 fw-bold">
              <span>Total</span>
              <span>₹{r.lineTotal}</span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

