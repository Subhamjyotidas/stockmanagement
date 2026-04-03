import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";

export default function AIAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [salesForecast, setSalesForecast] = useState(null);
  const [stockAlerts, setStockAlerts] = useState(null);
  const [customerInsights, setCustomerInsights] = useState(null);
  const [profitInsights, setProfitInsights] = useState(null);
  const [businessTrends, setBusinessTrends] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load each endpoint individually to catch specific errors
      console.log("Loading quick-stats...");
      const s = await api.get("/ai/quick-stats");
      setStats(s.data);
      console.log("quick-stats loaded:", s.data);

      console.log("Loading sales-forecast...");
      const sf = await api.get("/ai/sales-forecast");
      setSalesForecast(sf.data);
      console.log("sales-forecast loaded");

      console.log("Loading stock-alerts...");
      const sa = await api.get("/ai/stock-alerts");
      setStockAlerts(sa.data);
      console.log("stock-alerts loaded");

      console.log("Loading customer-insights...");
      const ci = await api.get("/ai/customer-insights");
      setCustomerInsights(ci.data);
      console.log("customer-insights loaded");

      console.log("Loading profit-insights...");
      const pi = await api.get("/ai/profit-insights");
      setProfitInsights(pi.data);
      console.log("profit-insights loaded");

      console.log("Loading business-trends...");
      const bt = await api.get("/ai/business-trends");
      setBusinessTrends(bt.data);
      console.log("business-trends loaded");

    } catch (err) {
      console.error("Error loading AI data:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Failed to load AI analytics");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Analyzing your data...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="alert alert-danger m-3">
          <h5>Error Loading AI Analytics</h5>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={loadAllData}>
            Try Again
          </button>
        </div>
        <div className="m-3">
          <pre>{JSON.stringify({ stats, salesForecast, stockAlerts, customerInsights, profitInsights, businessTrends }, null, 2)}</pre>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="ai-analytics">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>🤖 AI Analytics Dashboard</h4>
          <button className="btn btn-outline-primary btn-sm" onClick={loadAllData}>
            ↻ Refresh Analysis
          </button>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "sales" ? "active" : ""}`}
              onClick={() => setActiveTab("sales")}
            >
              📈 Sales Forecast
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "stock" ? "active" : ""}`}
              onClick={() => setActiveTab("stock")}
            >
              📦 Stock Alerts
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "customers" ? "active" : ""}`}
              onClick={() => setActiveTab("customers")}
            >
              👥 Customers
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "profit" ? "active" : ""}`}
              onClick={() => setActiveTab("profit")}
            >
              💰 Profit
            </button>
          </li>
        </ul>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="row g-3">
            {/* Quick Stats Cards */}
            <div className="col-12">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="card p-3 text-center">
                    <h6 className="text-muted">Total Revenue</h6>
                    <h4 className="text-success">₹{Number(stats?.totalRevenue || 0).toLocaleString()}</h4>
                    <small className={stats?.revenueGrowth >= 0 ? "text-success" : "text-danger"}>
                      {stats?.revenueGrowth >= 0 ? "↑" : "↓"} {Math.abs(stats?.revenueGrowth || 0)}% vs last period
                    </small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card p-3 text-center">
                    <h6 className="text-muted">Total Orders</h6>
                    <h4>{stats?.totalOrders || 0}</h4>
                    <small className="text-muted">{stats?.recentOrders || 0} this month</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card p-3 text-center">
                    <h6 className="text-muted">Customers</h6>
                    <h4>{stats?.totalCustomers || 0}</h4>
                    <small className="text-muted">{stats?.totalItems || 0} items</small>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card p-3 text-center">
                    <h6 className="text-muted">Low Stock Items</h6>
                    <h4 className={stats?.lowStockItems > 0 ? "text-warning" : "text-success"}>
                      {stats?.lowStockItems || 0}
                    </h4>
                    <small className="text-muted">Need attention</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Health */}
            <div className="col-12 col-md-6">
              <div className="card p-3">
                <h6><b>📊 Business Health</b></h6>
                <div className="mt-3">
                  {businessTrends?.insights?.map((insight, idx) => (
                    <div key={idx} className="mb-2 p-2 bg-light rounded">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stock Alerts Summary */}
            <div className="col-12 col-md-6">
              <div className="card p-3">
                <h6><b>📦 Stock Status</b></h6>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>🔴 Critical</span>
                    <span className="badge bg-danger">{stockAlerts?.summary?.critical || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>🟡 Low Stock</span>
                    <span className="badge bg-warning">{stockAlerts?.summary?.low || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>🟢 Healthy</span>
                    <span className="badge bg-success">{stockAlerts?.summary?.healthy || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="col-12 col-md-6">
              <div className="card p-3">
                <h6><b>👥 Customer Segments</b></h6>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>⭐ VIP Customers</span>
                    <span className="badge bg-warning">{customerInsights?.segments?.vip || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>💎 Premium</span>
                    <span className="badge bg-info">{customerInsights?.segments?.premium || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>👤 Regular</span>
                    <span className="badge bg-primary">{customerInsights?.segments?.regular || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>🔹 Occasional</span>
                    <span className="badge bg-secondary">{customerInsights?.segments?.occasional || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Summary */}
            <div className="col-12 col-md-6">
              <div className="card p-3">
                <h6><b>💰 Profit Summary</b></h6>
                <div className="mt-3">
                  <p className="mb-1">
                    Total Profit: <b className="text-success">₹{Number(profitInsights?.summary?.totalProfit || 0).toLocaleString()}</b>
                  </p>
                  <p className="mb-1">
                    Daily Average: <b>₹{Number(profitInsights?.summary?.avgDailyProfit || 0).toLocaleString()}</b>
                  </p>
                  <p className="mb-0">
                    Trend: <span className={profitInsights?.summary?.trend >= 0 ? "text-success" : "text-danger"}>
                      {profitInsights?.summary?.trend >= 0 ? "↑" : "↓"} {Math.abs(profitInsights?.summary?.trend || 0)}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Forecast Tab */}
        {activeTab === "sales" && (
          <div className="row g-3">
            <div className="col-12">
              <div className="card p-3">
                <h6><b>📈 Sales Forecast</b></h6>
                <div className="mt-3">
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Average Daily Sales</small>
                        <h4>₹{Number(salesForecast?.summary?.avgDailySales || 0).toLocaleString()}</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Average Daily Orders</small>
                        <h4>{salesForecast?.summary?.avgDailyOrders || 0}</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Sales Trend</small>
                        <h4 className={salesForecast?.summary?.trend >= 0 ? "text-success" : "text-danger"}>
                          {salesForecast?.summary?.trend >= 0 ? "↑" : "↓"} {Math.abs(salesForecast?.summary?.trend || 0)}%
                        </h4>
                      </div>
                    </div>
                  </div>

                  <h6>30-Day Sales Forecast</h6>
                  <div className="table-responsive mt-2">
                    <table className="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Predicted Sales</th>
                          <th>Predicted Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesForecast?.forecast?.slice(0, 14).map((day, idx) => (
                          <tr key={idx}>
                            <td>{day.date}</td>
                            <td>₹{day.predictedSales.toLocaleString()}</td>
                            <td>{day.predictedOrders}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Alerts Tab */}
        {activeTab === "stock" && (
          <div className="row g-3">
            <div className="col-12">
              <div className="card p-3">
                <h6><b>📦 Stock Alerts & Reorder Recommendations</b></h6>
                <div className="mt-3">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="p-3 bg-danger bg-opacity-10 rounded">
                        <small className="text-danger">Critical Items</small>
                        <h4 className="text-danger">{stockAlerts?.summary?.critical || 0}</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-warning bg-opacity-10 rounded">
                        <small className="text-warning">Low Stock</small>
                        <h4 className="text-warning">{stockAlerts?.summary?.low || 0}</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-success bg-opacity-10 rounded">
                        <small className="text-success">Healthy Stock</small>
                        <h4 className="text-success">{stockAlerts?.summary?.healthy || 0}</h4>
                      </div>
                    </div>
                  </div>

                  <h6>Items Requiring Attention</h6>
                  <div className="table-responsive mt-2">
                    <table className="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Current Stock</th>
                          <th>Daily Usage</th>
                          <th>Days Left</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockAlerts?.alerts?.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.itemName}</td>
                            <td>{item.currentStock}</td>
                            <td>{item.dailyAvgConsumption}</td>
                            <td>{item.daysUntilEmpty}</td>
                            <td>
                              <span className={`badge bg-${item.status === "out_of_stock" ? "danger" : item.status === "critical" ? "danger" : "warning"}`}>
                                {item.status === "out_of_stock" ? "Out of Stock" : item.status === "critical" ? "Critical" : "Low"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!stockAlerts?.alerts || stockAlerts.alerts.length === 0) && (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">No stock alerts</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="row g-3">
            <div className="col-12">
              <div className="card p-3">
                <h6><b>👥 Customer Insights & Segmentation</b></h6>
                <div className="mt-3">
                  <div className="row mb-3">
                    <div className="col-md-2">
                      <div className="p-2 bg-warning bg-opacity-10 rounded text-center">
                        <small className="text-warning">VIP</small>
                        <h5>{customerInsights?.segments?.vip || 0}</h5>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="p-2 bg-info bg-opacity-10 rounded text-center">
                        <small className="text-info">Premium</small>
                        <h5>{customerInsights?.segments?.premium || 0}</h5>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="p-2 bg-primary bg-opacity-10 rounded text-center">
                        <small className="text-primary">Regular</small>
                        <h5>{customerInsights?.segments?.regular || 0}</h5>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="p-2 bg-secondary bg-opacity-10 rounded text-center">
                        <small className="text-secondary">Occasional</small>
                        <h5>{customerInsights?.segments?.occasional || 0}</h5>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="p-2 bg-light rounded text-center">
                        <small className="text-muted">Inactive</small>
                        <h5>{customerInsights?.segments?.inactive || 0}</h5>
                      </div>
                    </div>
                  </div>

                  {/* VIP Customers */}
                  {customerInsights?.customers?.filter(c => c.segment === "vip").length > 0 && (
                    <>
                      <h6 className="text-warning mt-4">⭐ VIP Customers ({customerInsights?.customers?.filter(c => c.segment === "vip").length})</h6>
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-striped table-responsive-sm">
                          <thead className="table-dark">
                            <tr>
                              <th className="small">Customer</th>
                              <th className="small d-none d-md-table-cell">Phone</th>
                              <th className="small">Orders</th>
                              <th className="small">Total</th>
                              <th className="small d-none d-lg-table-cell">Avg</th>
                              <th className="small d-none d-sm-table-cell">Last</th>
                              <th className="small">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerInsights?.customers?.filter(c => c.segment === "vip").map((customer, idx) => (
                              <tr key={idx}>
                                <td className="small">{customer.name}</td>
                                <td className="small d-none d-md-table-cell">{customer.phone}</td>
                                <td className="small">{customer.orderCount}</td>
                                <td className="small text-success">₹{customer.totalSpent.toLocaleString()}</td>
                                <td className="small d-none d-lg-table-cell">₹{customer.avgOrderValue.toLocaleString()}</td>
                                <td className="small d-none d-sm-table-cell">{customer.daysSinceLastOrder}d</td>
                                <td className="small"><span className="badge bg-warning">{customer.score}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Premium Customers */}
                  {customerInsights?.customers?.filter(c => c.segment === "premium").length > 0 && (
                    <>
                      <h6 className="text-info mt-4">💎 Premium Customers ({customerInsights?.customers?.filter(c => c.segment === "premium").length})</h6>
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-striped table-responsive-sm">
                          <thead className="table-dark">
                            <tr>
                              <th className="small">Customer</th>
                              <th className="small d-none d-md-table-cell">Phone</th>
                              <th className="small">Orders</th>
                              <th className="small">Total</th>
                              <th className="small d-none d-lg-table-cell">Avg</th>
                              <th className="small d-none d-sm-table-cell">Last</th>
                              <th className="small">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerInsights?.customers?.filter(c => c.segment === "premium").map((customer, idx) => (
                              <tr key={idx}>
                                <td className="small">{customer.name}</td>
                                <td className="small d-none d-md-table-cell">{customer.phone}</td>
                                <td className="small">{customer.orderCount}</td>
                                <td className="small text-success">₹{customer.totalSpent.toLocaleString()}</td>
                                <td className="small d-none d-lg-table-cell">₹{customer.avgOrderValue.toLocaleString()}</td>
                                <td className="small d-none d-sm-table-cell">{customer.daysSinceLastOrder}d</td>
                                <td className="small"><span className="badge bg-info">{customer.score}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Regular Customers */}
                  {customerInsights?.customers?.filter(c => c.segment === "regular").length > 0 && (
                    <>
                      <h6 className="text-primary mt-4">👤 Regular Customers ({customerInsights?.customers?.filter(c => c.segment === "regular").length})</h6>
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-striped table-responsive-sm">
                          <thead className="table-dark">
                            <tr>
                              <th className="small">Customer</th>
                              <th className="small d-none d-md-table-cell">Phone</th>
                              <th className="small">Orders</th>
                              <th className="small">Total</th>
                              <th className="small d-none d-lg-table-cell">Avg</th>
                              <th className="small d-none d-sm-table-cell">Last</th>
                              <th className="small">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerInsights?.customers?.filter(c => c.segment === "regular").map((customer, idx) => (
                              <tr key={idx}>
                                <td className="small">{customer.name}</td>
                                <td className="small d-none d-md-table-cell">{customer.phone}</td>
                                <td className="small">{customer.orderCount}</td>
                                <td className="small text-success">₹{customer.totalSpent.toLocaleString()}</td>
                                <td className="small d-none d-lg-table-cell">₹{customer.avgOrderValue.toLocaleString()}</td>
                                <td className="small d-none d-sm-table-cell">{customer.daysSinceLastOrder}d</td>
                                <td className="small"><span className="badge bg-primary">{customer.score}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Occasional Customers */}
                  {customerInsights?.customers?.filter(c => c.segment === "occasional").length > 0 && (
                    <>
                      <h6 className="text-secondary mt-4">🔹 Occasional Customers ({customerInsights?.customers?.filter(c => c.segment === "occasional").length})</h6>
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-striped table-responsive-sm">
                          <thead className="table-dark">
                            <tr>
                              <th className="small">Customer</th>
                              <th className="small d-none d-md-table-cell">Phone</th>
                              <th className="small">Orders</th>
                              <th className="small">Total</th>
                              <th className="small d-none d-lg-table-cell">Avg</th>
                              <th className="small d-none d-sm-table-cell">Last</th>
                              <th className="small">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerInsights?.customers?.filter(c => c.segment === "occasional").map((customer, idx) => (
                              <tr key={idx}>
                                <td className="small">{customer.name}</td>
                                <td className="small d-none d-md-table-cell">{customer.phone}</td>
                                <td className="small">{customer.orderCount}</td>
                                <td className="small text-success">₹{customer.totalSpent.toLocaleString()}</td>
                                <td className="small d-none d-lg-table-cell">₹{customer.avgOrderValue.toLocaleString()}</td>
                                <td className="small d-none d-sm-table-cell">{customer.daysSinceLastOrder}d</td>
                                <td className="small"><span className="badge bg-secondary">{customer.score}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Inactive Customers */}
                  {customerInsights?.customers?.filter(c => c.segment === "inactive").length > 0 && (
                    <>
                      <h6 className="text-muted mt-4">💤 Inactive Customers ({customerInsights?.customers?.filter(c => c.segment === "inactive").length})</h6>
                      <div className="table-responsive mt-2">
                        <table className="table table-sm table-striped table-responsive-sm">
                          <thead className="table-dark">
                            <tr>
                              <th className="small">Customer</th>
                              <th className="small d-none d-md-table-cell">Phone</th>
                              <th className="small">Orders</th>
                              <th className="small">Total</th>
                              <th className="small d-none d-lg-table-cell">Avg</th>
                              <th className="small d-none d-sm-table-cell">Last</th>
                              <th className="small">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerInsights?.customers?.filter(c => c.segment === "inactive").map((customer, idx) => (
                              <tr key={idx}>
                                <td className="small">{customer.name}</td>
                                <td className="small d-none d-md-table-cell">{customer.phone}</td>
                                <td className="small">{customer.orderCount}</td>
                                <td className="small text-success">₹{customer.totalSpent.toLocaleString()}</td>
                                <td className="small d-none d-lg-table-cell">₹{customer.avgOrderValue.toLocaleString()}</td>
                                <td className="small d-none d-sm-table-cell">{customer.daysSinceLastOrder}d</td>
                                <td className="small"><span className="badge bg-light text-dark">{customer.score}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profit Tab */}
        {activeTab === "profit" && (
          <div className="row g-3">
            <div className="col-12">
              <div className="card p-3">
                <h6><b>💰 Profit Insights & Forecasting</b></h6>
                <div className="mt-3">
                  <div className="row mb-4">
                    <div className="col-md-3">
                      <div className="p-3 bg-success bg-opacity-10 rounded">
                        <small className="text-muted">Total Profit</small>
                        <h4 className="text-success">₹{Number(profitInsights?.summary?.totalProfit || 0).toLocaleString()}</h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Daily Average</small>
                        <h4>₹{Number(profitInsights?.summary?.avgDailyProfit || 0).toLocaleString()}</h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Trend</small>
                        <h4 className={profitInsights?.summary?.trend >= 0 ? "text-success" : "text-danger"}>
                          {profitInsights?.summary?.trend >= 0 ? "↑" : "↓"} {Math.abs(profitInsights?.summary?.trend || 0)}%
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted">Month over Month</small>
                        <h4 className={profitInsights?.summary?.monthOverMonth >= 0 ? "text-success" : "text-danger"}>
                          {profitInsights?.summary?.monthOverMonth >= 0 ? "↑" : "↓"} {Math.abs(profitInsights?.summary?.monthOverMonth || 0)}%
                        </h4>
                      </div>
                    </div>
                  </div>

                  <h6>30-Day Profit Forecast</h6>
                  <div className="table-responsive mt-2">
                    <table className="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Predicted Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitInsights?.forecast?.slice(0, 14).map((day, idx) => (
                          <tr key={idx}>
                            <td>{day.date}</td>
                            <td className="text-success">₹{day.predictedProfit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ai-analytics .nav-link {
          cursor: pointer;
          color: #495057;
        }
        .ai-analytics .nav-link.active {
          color: #0d6efd;
          font-weight: 600;
          border-bottom: 2px solid #0d6efd;
        }
        .vh-110 {
          height: 110vh;
        }
      `}</style>
    </Layout>
  );
}

