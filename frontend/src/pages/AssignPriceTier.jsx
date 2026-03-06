import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function AssignPriceTier() {
  const [customers, setCustomers] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedTierId, setSelectedTierId] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    const [cRes, tRes] = await Promise.all([
      api.get("/customers", { params: { page: "all" } }),
      api.get("/price-tiers"),
    ]);
    setCustomers(cRes.data.data || []);
    setTiers(tRes.data || []);
  };

  useEffect(() => { load(); }, []);

  const toggle = (id, checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked, list) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      list.forEach(c => { if (checked) next.add(c.id); else next.delete(c.id); });
      return next;
    });
  };

  const apply = async () => {
    if (!selectedTierId) return alert("Select a tier");
    if (selectedIds.size === 0) return alert("Select at least one Customer");

    // No bulk endpoint yet: do sequential updates
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await api.put(`/customers/${id}`, { priceTierId: Number(selectedTierId) });
    }
    alert("Data Successfully Updated");
    setSelectedIds(new Set());
    await load();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.mobileNo || "").includes(search)
  );

  return (
    <Layout>
      <h4 className="mb-3">Assign Price Tier to Customers</h4>

      <div className="card p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label">Price Tier</label>
            <select className="form-select" value={selectedTierId} onChange={e=>setSelectedTierId(e.target.value)}>
              <option value="">-- Select Tier --</option>
              {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Search</label>
            <input className="form-control" placeholder="name or mobile" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="col-12 col-md-4 d-grid">
            <button className="btn btn-primary" onClick={apply}>Apply to Selected</button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th style={{width: 50}}>
                <input type="checkbox" onChange={e=>toggleAll(e.target.checked, filtered)} />
              </th>
              <th style={{width: 80}}>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Address</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <input type="checkbox" checked={selectedIds.has(c.id)} onChange={e=>toggle(c.id, e.target.checked)} />
                </td>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.mobileNo}</td>
                <td>{c.address}</td>
                <td>{c.priceTierId ? (tiers.find(t=>t.id===c.priceTierId)?.name || c.priceTierId) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="d-md-none">
        {filtered.map(c => (
          <div key={c.id} className="border rounded p-3 mb-2">
            <div className="form-check mb-2">
              <input 
                type="checkbox" 
                className="form-check-input" 
                id={`check-${c.id}`}
                checked={selectedIds.has(c.id)} 
                onChange={e=>toggle(c.id, e.target.checked)} 
              />
              <label className="form-check-label" htmlFor={`check-${c.id}`}>
                Select
              </label>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">ID:</span>
              <span>{c.id}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Name:</span>
              <b>{c.name}</b>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Mobile:</span>
              <span>{c.mobileNo}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Address:</span>
              <span>{c.address}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Tier:</span>
              <span className="badge bg-primary">
                {c.priceTierId ? (tiers.find(t=>t.id===c.priceTierId)?.name || c.priceTierId) : "-"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
