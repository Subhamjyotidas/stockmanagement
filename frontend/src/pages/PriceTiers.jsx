import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function PriceTiers() {
  const [tiers, setTiers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState(null);
  const [tierName, setTierName] = useState("");
  const [tierDesc, setTierDesc] = useState("");
  const [prices, setPrices] = useState({}); // itemId -> price string

  const selectedTier = useMemo(() => tiers.find(t => t.id === selectedTierId), [tiers, selectedTierId]);

  const load = async () => {
    const [tiersRes, itemsRes] = await Promise.all([
      api.get("/price-tiers"),
      api.get("/items"),
    ]);
    setTiers(tiersRes.data);
    setItems(itemsRes.data);

    if (tiersRes.data.length && !selectedTierId) {
      setSelectedTierId(tiersRes.data[0].id);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedTierId) return;
    // load prices for the selected tier
    (async () => {
      const res = await api.get(`/price-tiers/${selectedTierId}`);
      const map = {};
      (res.data?.items || []).forEach((row) => {
        map[row.itemId] = String(row.sellingPrice ?? "");
      });
      // Set default buying prices for items without tier prices
      items.forEach(item => {
        if (!map[item.id] && item.buyingPrice) {
          map[item.id] = String(item.buyingPrice);
        }
      });
      setPrices(map);
      setTierName(res.data?.name || "");
      setTierDesc(res.data?.description || "");
    })();
  }, [selectedTierId, items]);

  const createTier = async (e) => {
    e.preventDefault();
    if (!tierName.trim()) return alert("Tier name required");
    const res = await api.post("/price-tiers", { name: tierName, description: tierDesc });
    setTiers(prev => [...prev, res.data]);
    setSelectedTierId(res.data.id);
  };

  const saveMeta = async () => {
    if (!selectedTierId) return;
    await api.put(`/price-tiers/${selectedTierId}`, { name: tierName, description: tierDesc });
    setTiers(prev => prev.map(t => t.id === selectedTierId ? { ...t, name: tierName, description: tierDesc } : t));
    alert("Saved");
  };

  const savePrices = async () => {
    if (!selectedTierId) return;
    const payload = Object.entries(prices)
      .filter(([_, v]) => v !== "" && !Number.isNaN(Number(v)))
      .map(([itemId, v]) => ({ itemId: Number(itemId), sellingPrice: Number(v) }));
    await api.put(`/price-tiers/${selectedTierId}/items`, payload);
    alert("Prices saved");
  };

  const deleteTier = async () => {
    if (!selectedTierId) return;
    if (!confirm("Delete this tier? This cannot be undone.")) return;
    try {
      await api.delete(`/price-tiers/${selectedTierId}`);
      const next = tiers.filter(t => t.id !== selectedTierId);
      setTiers(next);
      setSelectedTierId(next[0]?.id || null);
      setPrices({});
      setTierName("");
      setTierDesc("");
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <Layout>
      <h4 className="mb-3">Price Tiers</h4>

      <div className="row g-3">
        <div className="col-12 col-lg-3">
          <div className="card p-3">
            <h6 className="mb-2">Tiers</h6>
            <div className="list-group small">
              {tiers.map(t => (
                <button key={t.id} className={`list-group-item list-group-item-action ${selectedTierId===t.id?'active':''}`}
                  onClick={() => setSelectedTierId(t.id)}>
                  {t.name}
                </button>
              ))}
            </div>

            <hr />
            <form onSubmit={createTier} className="d-grid gap-2">
              <input className="form-control form-control-sm" placeholder="New tier name" value={tierName} onChange={e=>setTierName(e.target.value)} />
              <input className="form-control form-control-sm" placeholder="Description (optional)" value={tierDesc} onChange={e=>setTierDesc(e.target.value)} />
              <button className="btn btn-sm btn-primary">Create Tier</button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-9">
          <div className="card p-3">
            <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center mb-3">
              <div className="me-auto">
                <h6 className="mb-0">Tier details</h6>
                <small className="text-muted">Edit metadata and per-item prices</small>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-danger" onClick={deleteTier} disabled={!selectedTierId}>Delete</button>
                <button className="btn btn-sm btn-secondary" onClick={saveMeta} disabled={!selectedTierId}>Save Meta</button>
                <button className="btn btn-sm btn-primary" onClick={savePrices} disabled={!selectedTierId}>Save Prices</button>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label form-label-sm">Tier name</label>
                <input className="form-control form-control-sm" value={tierName} onChange={e=>setTierName(e.target.value)} disabled={!selectedTierId} />
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label form-label-sm">Description</label>
                <input className="form-control form-control-sm" value={tierDesc} onChange={e=>setTierDesc(e.target.value)} disabled={!selectedTierId} />
              </div>
            </div>

            <div className="table-responsive" style={{maxHeight: "60vh"}}>
              <table className="table table-bordered table-striped table-sm align-middle">
                <thead className="table-dark">
                  <tr>
                    <th style={{width: 80}}>ID</th>
                    <th>Item</th>
                    <th style={{width: 160}}>Selling Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.id}>
                      <td>{i.id}</td>
                      <td>{i.name}</td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control form-control-sm"
                          value={prices[i.id] ?? ""}
                          onChange={e => setPrices(p => ({...p, [i.id]: e.target.value}))}
                          disabled={!selectedTierId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
