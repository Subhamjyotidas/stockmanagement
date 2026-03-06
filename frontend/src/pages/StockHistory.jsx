import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function StockHistory() {
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = selectedItem ? { itemId: selectedItem.id } : {};
        const res = await api.get("/stock/history", { params });
        setRows(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load stock history");
      }
      setLoading(false);
    };
    load();
  }, [selectedItem]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${h}:${m}`;
  };

  return (
    <Layout>
      <h4 className="mb-3">Stock History</h4>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <Select
            placeholder="All items"
            isClearable
            options={items.map(i => ({ value: i.id, label: i.name }))}
            value={
              selectedItem
                ? { value: selectedItem.id, label: selectedItem.name }
                : null
            }
            onChange={opt =>
              setSelectedItem(opt ? { id: opt.value, name: opt.label } : null)
            }
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Date & Time</th>
              <th>Item</th>
              <th>Action</th>
              <th>Qty Before</th>
              <th>Qty After</th>
              <th>Price Before</th>
              <th>Price After</th>
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
            {rows.map(r => (
              <tr key={r.id}>
                <td>{formatDate(r.createdAt)}</td>
                <td>{r.itemName}</td>
                <td>
                  <span
                    className={`badge ${
                      r.action === "ENTRY"
                        ? "bg-success"
                        : r.action === "ADD"
                        ? "bg-primary"
                        : r.action === "EDIT"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {r.action}
                  </span>
                </td>
                <td>{r.qtyBefore ?? "-"}</td>
                <td>{r.qtyAfter ?? "-"}</td>
                <td>{r.buyingPriceBefore != null ? `₹${r.buyingPriceBefore}` : "-"}</td>
                <td>{r.buyingPriceAfter != null ? `₹${r.buyingPriceAfter}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="d-md-none">
        {rows.length === 0 && (
          <div className="text-center text-muted py-4">
            {loading ? "Loading..." : "No records"}
          </div>
        )}
        {rows.map(r => (
          <div key={r.id} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between mb-1">
              <b>{r.itemName}</b>
              <span
                className={`badge ${
                  r.action === "ENTRY"
                    ? "bg-success"
                    : r.action === "ADD"
                    ? "bg-primary"
                    : r.action === "EDIT"
                    ? "bg-warning text-dark"
                    : "bg-danger"
                }`}
              >
                {r.action}
              </span>
            </div>
            <div className="small text-muted mb-2">{formatDate(r.createdAt)}</div>
            <div className="d-flex justify-content-between">
              <span>Qty</span>
              <span>
                {r.qtyBefore ?? "-"} → {r.qtyAfter ?? "-"}
              </span>
            </div>
            {(r.buyingPriceBefore != null || r.buyingPriceAfter != null) && (
              <div className="d-flex justify-content-between mt-1">
                <span>Price</span>
                <span>
                  {r.buyingPriceBefore != null ? `₹${r.buyingPriceBefore}` : "-"} →{" "}
                  {r.buyingPriceAfter != null ? `₹${r.buyingPriceAfter}` : "-"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
