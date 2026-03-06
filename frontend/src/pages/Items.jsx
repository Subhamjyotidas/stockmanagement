import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function Items() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await api.get("/items");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Item name required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/items/${editingId}`, { name });
      } else {
        await api.post("/items", { name });
      }

      setName("");
      setEditingId(null);
      load();
    } catch (err) {
      alert("Save failed");
    }
  };

  const editItem = (item) => {
    setName(item.name);
    setEditingId(item.id);
  };

  const deleteItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/items/${id}`);
    load();
  };

  return (
    <Layout>
      <h4 className="mb-3">Items</h4>

      {/* ================= FORM ================= */}
      <form onSubmit={submit} className="card p-3 mb-3">
        <div className="d-flex flex-column flex-md-row gap-2">
          <input
            className="form-control"
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button className="btn btn-primary">
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setName("");
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
              <th style={{ width: 80 }}>ID</th>
              <th>Name</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.name}</td>
                <td>
                  <div className="d-flex flex-column flex-md-row gap-1">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => editItem(i)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteItem(i.id)}
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
        {items.map((i) => (
          <div key={i.id} className="border rounded p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <div className="text-muted small">ID: {i.id}</div>
                <b>{i.name}</b>
              </div>
            </div>
            <div className="d-grid gap-2">
              <button
                className="btn btn-warning btn-sm"
                onClick={() => editItem(i)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteItem(i.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
