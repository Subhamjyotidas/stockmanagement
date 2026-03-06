import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../layout/Layout";
import Select from "react-select";

export default function Orders() {
  /* ======================
     MASTER DATA
  ====================== */
  const [customers, setCustomers] = useState([]);



  const [stock, setStock] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState({
    paid: true,
    partial: true,
    unpaid: true
  });



  /* ======================
     CREATE ORDER
  ====================== */
  const [header, setHeader] = useState({
    customerId: "",
    billNo: "",
    billDate: "",
    comments: "",
    billImage: null
  });

  const [currentItem, setCurrentItem] = useState({
    stockId: "",
    itemId: "",
    itemName: "",
    buyingPrice: "",
    sellingPrice: "",
    qty: ""
  });

  // Track the selected customer's price tier
  const [selectedPriceTierId, setSelectedPriceTierId] = useState(null);

  const [items, setItems] = useState([]);
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch tier-based price for a customer+item combination
  const fetchTierPrice = async (customerId, itemId) => {
    if (!customerId || !itemId) return null;
    try {
      const res = await api.get(`/price-tiers/pricing/resolve`, {
        params: { customerId, itemId }
      });
      return res.data.sellingPrice;
    } catch (err) {
      // No tier price found, return null
      return null;
    }
  };

  /* ======================
     ORDER LIST
  ====================== */
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);


  //useEffect(() => { loadOrders(); }, [search, page]);
  /* ======================
     EDIT MODAL
  ====================== */
  const [showEdit, setShowEdit] = useState(false);
  const [editHeader, setEditHeader] = useState({});
  const [editItems, setEditItems] = useState([]);
  const [editImage, setEditImage] = useState(null);
  const [editNewItem, setEditNewItem] = useState({
    stockId: "",
    itemId: "",
    itemName: "",
    buyingPrice: "",
    sellingPrice: "",
    qty: ""
  });
  const [showPayment, setShowPayment] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [payments, setPayments] = useState([]);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    discountAmount: 0,
    paymentMode: "cash",
    paidOn: new Date().toISOString().slice(0, 10)
  });
  const [editNewItems, setEditNewItems] = useState([]);
  /* ======================
     INVOICE PREVIEW
  ====================== */
  const [invoice, setInvoice] = useState(null);

  /* ======================
     INITIAL LOAD
  ====================== */
  //add query param to the customer with pagevalue =all to get all customers

  useEffect(() => {
    api.get("/customers", { params: { page: "all" } }).then(r => setCustomers(r.data.data));
    loadStock();
    loadOrders();
  }, []);
  const loadStock = async () => {
    const res = await api.get("/stock");
    setStock(res.data);
  };
  useEffect(() => {
    const t = setTimeout(() => {
      loadOrders();
    }, 400);

    return () => clearTimeout(t);
  }, [search, page, paymentStatusFilter]);
  /* ======================
     LOAD ORDERS
  ====================== */
  const loadOrders = async () => {
    const res = await api.get("/orders", {
      params: {
        search,
        page,
        paymentStatus: Object.keys(paymentStatusFilter).filter(key => paymentStatusFilter[key]).join(',')
      }
    });
    setOrders(res.data.data);
    setPages(res.data.pagination.pages);
  };
  const calculateProfit = (order) => {
    if (!order.items || order.items.length === 0) return 0;

    const totalSelling = order.items.reduce((sum, item) =>
      sum + (Number(item.sellingPrice) * Number(item.qty)), 0
    );

    const totalBuying = order.items.reduce((sum, item) =>
      sum + (Number(item.buyingPrice) * Number(item.qty)), 0
    );

    return totalSelling - totalBuying;
  };
  /* ======================
     CREATE ORDER
  ====================== */
  const addItem = () => {
    // Header validation first
    if (!header.billNo || !header.billDate) {
      alert("Bill No and Bill Date are required before adding items");
      return;
    }

    // Item validation
    if (!currentItem.itemId || !currentItem.qty || !currentItem.sellingPrice) {
      alert("Fill item details");
      return;
    }

    // Duplicate check: itemId + buyingPrice
    const exists = items.some(
      i =>
        i.itemId === currentItem.itemId &&
        Number(i.buyingPrice) === Number(currentItem.buyingPrice)
    );

    if (exists) {
      alert("Item already added. Update quantity instead.");
      return;
    }
    setItems([...items, currentItem]);
    setCurrentItem({
      stockId: "",
      itemId: "",
      itemName: "",
      buyingPrice: "",
      sellingPrice: "",
      qty: ""
    });
  };
  const openPayment = async (order) => {
    setPaymentOrder(order);
    const res = await api.get(`/order-payments/${order.id}`);
    setPayments(res.data);
    setShowPayment(true);
  };
  const savePayment = async () => {
    const amount = Number(paymentForm.amount);
    const due = paymentOrder.dueAmount;

    // if (!amount ) {
    //   alert("Enter valid amount");
    //   return;
    // }

    if (amount > due) {
      alert(`Over-payment not allowed. Due amount: ₹${due}`);
      return;
    }

    try {
      await api.post("/order-payments", {
        orderId: paymentOrder.id,
        amount,
        discountAmount: paymentForm.discountAmount,
        paymentMode: paymentForm.paymentMode,
        paidOn: paymentForm.paidOn
      });

      // Reset form
      setPaymentForm({
        amount: "",
        discountAmount: 0,
        paymentMode: "cash",
        paidOn: new Date().toISOString().slice(0, 10)
      });

      // Refresh payment history for the same order
      const res = await api.get(`/order-payments/${paymentOrder.id}`);
      setPayments(res.data);

      // Refresh orders list to update payment status
      await loadOrders();

      // Show success message
      alert("Payment added successfully!");
      // Close modal after successful payment
      setShowPayment(false);
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.response?.data?.message || "Payment failed");
    }
  };


  const submit = async e => {
    e.preventDefault();

    if (!header.customerId) return alert("Select customer");
    if (!items.length) return alert("Add items");

    const fd = new FormData();
    Object.entries(header).forEach(([k, v]) => v && fd.append(k, v));
    fd.append(
      "items",
      JSON.stringify(
        items.map(i => ({
          itemId: i.itemId,
          buyingPrice: i.buyingPrice,
          sellingPrice: i.sellingPrice,
          qty: Number(i.qty)
        }))
      )
    );

    try {
      setIsCreating(true);
      await api.post("/orders", fd);
      alert("Order created");
      await loadOrders();
      await loadStock();

      setHeader({
        customerId: "",
        billNo: "",
        billDate: "",
        comments: "",
        billImage: null
      });
      setItems([]);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    } finally {
      setIsCreating(false); // Stop loading
    }


  };

  /* ======================
     EDIT ORDER
  ====================== */
  const openEdit = async id => {
    const res = await api.get(`/orders/${id}`);
    setEditHeader(res.data);
    setEditItems(res.data.items || []);
    setShowEdit(true);
  };
  const openInvoice = async (id) => {
    const res = await api.get(`/orders/${id}`);
    setInvoiceData(res.data);
    setShowInvoice(true);
  };
  const addEditItem = s => {
    setEditItems([
      ...editItems,
      {
        itemId: s.item.id,
        qty: 1,
        buyingPrice: s.buyingPrice,
        sellingPrice: s.sellingPricePrice
      }
    ]);
  };
  const saveEdit = async () => {
    setIsEditing(true);

    try {
      const fd = new FormData();
      fd.append("billNo", editHeader.billNo);
      fd.append("billDate", editHeader.billDate);
      fd.append("comments", editHeader.comments || "");
      fd.append("items", JSON.stringify(editItems));
      if (editImage) fd.append("billImage", editImage);

      await api.put(`/orders/${editHeader.id}`, fd);
      alert("Order updated successfully!");
      setShowEdit(false);
      await loadOrders();
      await loadStock();
    } catch (err) {
      console.error('Edit error:', err);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setIsEditing(false);
    }
  };


  /* ======================
     DELETE ORDER
  ====================== */
  const removeOrder = async id => {
    if (!confirm("Delete this order?")) return;
    await api.delete(`/orders/${id}`);
    await loadOrders();
    await loadStock();
  };

  return (
    <Layout>
      <h4>Create Order</h4>

      {/* ================= CREATE FORM ================= */}
      <form className="card p-3 p-md-4 mb-4" onSubmit={submit}>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <Select
              placeholder="Select Customer"
              options={customers.map(c => ({
                value: c.id,
                label: c.name
              }))}
              value={
                customers
                  .map(c => ({ value: c.id, label: c.name }))
                  .find(opt => opt.value === header.customerId) || null
              }
            onChange={opt => {
                const custId = opt?.value || "";
                setHeader({ ...header, customerId: custId });
                
                // Find the selected customer and get their priceTierId
                const cust = customers.find(c => c.id === custId);
                setSelectedPriceTierId(cust?.priceTierId || null);
              }}
              onFocus={opt => {
                // Find the selected customer and get their priceTierId
                const cust = customers.find(c => c.id === opt?.value);
                setSelectedPriceTierId(cust?.priceTierId || null);
              }}
            />
          </div>

          <div className="col-12 col-md-4">
            <input className="form-control"
              placeholder="Bill No"
              value={header.billNo}
              onChange={e => setHeader({ ...header, billNo: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-4">
            <input type="date" className="form-control"
              value={header.billDate}
              onChange={e => setHeader({ ...header, billDate: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-6" style={{ display: "none" }}>
            <textarea className="form-control"
              placeholder="Comments"
              value={header.comments}
              onChange={e => setHeader({ ...header, comments: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-6" style={{ display: "none" }}>
            <input type="file" className="form-control"
              onChange={e => setHeader({ ...header, billImage: e.target.files[0] })}
            />
          </div>
        </div>


        <hr />

        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <Select
              placeholder="Select Item"
              options={stock
                .filter(s => s.qty > 0) // Only show items with quantity > 0
                .map(s => ({
                  value: s.id,
                  label: `${s.item.name} | ₹${s.buyingPrice} | qty ${s.qty}`,
                  stockObj: s
                }))}
              value={
                stock
                  .map(s => ({
                    value: s.id,
                    label: `${s.item.name} | ₹${s.buyingPrice} | qty ${s.qty}`,
                    stockObj: s
                  }))
                  .find(opt => opt.value === currentItem.stockId) || null
              }
              onChange={async opt => {
                if (!opt) return;
                const s = opt.stockObj;

                // Default selling price to buying price
                let sellingPrice = s.buyingPrice;

                // If customer has a price tier, try to get tier-based price
                if (header.customerId && selectedPriceTierId) {
                  const tierPrice = await fetchTierPrice(header.customerId, s.item.id);
                  if (tierPrice !== null) {
                    sellingPrice = tierPrice;
                  }
                }

                setCurrentItem({
                  stockId: s.id,
                  itemId: s.item.id,
                  itemName: s.item.name,
                  buyingPrice: s.buyingPrice,
                  sellingPrice: sellingPrice,
                  qty: 1
                });
              }}
            />
          </div>

          <div className="col-6 col-md-2">
            <input className="form-control" type="number"
              value={currentItem.qty}
              onChange={e => setCurrentItem({ ...currentItem, qty: e.target.value })}
            />
          </div>

          <div className="col-6 col-md-2">
            <input className="form-control" type="number"
              value={currentItem.sellingPrice}
              onChange={e => setCurrentItem({ ...currentItem, sellingPrice: e.target.value })}
            />
          </div>

          <div className="col-12 col-md-2 d-grid">
            <button type="button" className="btn btn-primary" onClick={addItem}>
              Add Item
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="table-responsive mt-3">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Item</th>
                  <th>Buy</th>
                  <th>Sell</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.itemName}</td>
                    <td>{i.buyingPrice}</td>
                    <td>{i.sellingPrice}</td>
                    <td>{i.qty}</td>
                    <td>{i.qty * i.sellingPrice}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          setItems(items.filter((_, x) => x !== idx))
                        }
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-success mt-3"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creating...
            </>
          ) : (
            "Create Order"
          )}
        </button>
      </form>

      {/* ================= ORDER LIST ================= */}
      <h4>Orders</h4>

      <div className="row mb-3">
        <div className="col-12 col-md-3">
          <input
            className="form-control"
            placeholder="Search Bill / Customer"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1); // Reset to page 1 when searching
            }}
          />
        </div>
        <div className="col-12 col-md-9">
          <div className="d-flex gap-3 align-items-center">
            <label className="form-label mb-0 me-2">Payment Status:</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="filter-paid"
                checked={paymentStatusFilter.paid}
                onChange={e => setPaymentStatusFilter({
                  ...paymentStatusFilter,
                  paid: e.target.checked
                })}
              />
              <label className="form-check-label" htmlFor="filter-paid">Paid</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="filter-partial"
                checked={paymentStatusFilter.partial}
                onChange={e => setPaymentStatusFilter({
                  ...paymentStatusFilter,
                  partial: e.target.checked
                })}
              />
              <label className="form-check-label" htmlFor="filter-partial">Partial</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="filter-unpaid"
                checked={paymentStatusFilter.unpaid}
                onChange={e => setPaymentStatusFilter({
                  ...paymentStatusFilter,
                  unpaid: e.target.checked
                })}
              />
              <label className="form-check-label" htmlFor="filter-unpaid">Unpaid</label>
            </div>
          </div>
        </div>
      </div>
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered">
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Bill</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Bill Amount</th>
              <th>Due</th>
              <th>Profit/Loss</th>
              <th width="240">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const isPaid = o.paymentStatus === "paid";
              return (
                <tr key={o.id}>
                  {/* <td>{o.id}</td> */}
                  <td>{o.billNo}</td>
                  <td>{o.customer?.name}</td>
                  <td>{formatDate(o.billDate)}</td>
                  <td>
                    <span className={`badge ${o.paymentStatus === "paid"
                      ? "bg-success"
                      : o.paymentStatus === "partial"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                      }`}>
                      {o.paymentStatus || "unpaid"}
                    </span>
                  </td>

                  <td><b>₹{o.totalAmount ?? 0}</b></td>
                  <td><b>₹{o.dueAmount ?? 0}</b></td>
                  <td>
                    <span className={o.totalProfit < 0 ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"}>
                      ₹{o.totalProfit}
                    </span>
                  </td>
                  <td className="d-flex gap-1">
                    <button className="btn btn-sm btn-primary" disabled={isPaid} onClick={() => openEdit(o.id)}>Edit</button>
                    <button className="btn btn-sm btn-info" onClick={() => openInvoice(o.id)}>Invoice</button>
                    <button className="btn btn-sm btn-warning" disabled={isPaid} onClick={() => openPayment(o)}>Pay</button>
                    <button className="btn btn-sm btn-danger" disabled={isPaid} onClick={() => removeOrder(o.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* ===== MOBILE CARDS ===== */}
      <div className="d-md-none">
        {orders.map(o => {
          const isPaid = o.paymentStatus === "paid";
          return (
            <div key={o.id} className="border rounded p-3 mb-2">
              <div className="d-flex justify-content-between mb-1">
                <b>{o.billNo}</b>
                <span className={`badge ${o.paymentStatus === "paid"
                  ? "bg-success"
                  : o.paymentStatus === "partial"
                    ? "bg-warning text-dark"
                    : "bg-danger"
                  }`}>
                  {o.paymentStatus || "unpaid"}
                </span>
              </div>

              <div className="small text-muted">{o.customer?.name}</div>
              <div className="small">{formatDate(o.billDate)}</div>

              <div className="d-flex justify-content-between mt-2">
                <span>Due</span>
                <b>₹{o.dueAmount ?? 0}</b>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span>Profit/Loss</span>
                <span className={`badge ${Number(o.totalProfit || 0) < 0
                  ? "bg-danger-subtle text-danger"
                  : "bg-success-subtle text-success"
                  }`}>
                  ₹{Number(o.totalProfit || 0).toFixed(2)}
                </span>
              </div>
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-outline-primary btn-sm" disabled={isPaid} onClick={() => openEdit(o.id)}>Edit</button>
                <button className="btn btn-outline-info btn-sm" onClick={() => openInvoice(o.id)}>Invoice</button>
                <button className="btn btn-outline-warning btn-sm" disabled={isPaid} onClick={() => openPayment(o)}>Pay</button>
                <button className="btn btn-outline-danger btn-sm" disabled={isPaid} onClick={() => removeOrder(o.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
      {/* ================= EDIT MODAL ================= */}
      {showEdit && (
        <div className="modal show d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog modal-lg modal-fullscreen-sm-down">
            <div className="modal-content p-3">

              {/* ===== HEADER ===== */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Edit Order</h5>
                <button className="btn-close" onClick={() => setShowEdit(false)} />
              </div>

              {/* ===== BASIC INFO ===== */}
              <input
                className="form-control mb-2"
                placeholder="Bill No"
                value={editHeader.billNo}
                onChange={e =>
                  setEditHeader({ ...editHeader, billNo: e.target.value })
                }
              />

              <textarea
                className="form-control mb-2"
                placeholder="Comments"
                value={editHeader.comments || ""}
                onChange={e =>
                  setEditHeader({ ...editHeader, comments: e.target.value })
                }
              />

              <input
                type="file"
                className="form-control mb-3"
                onChange={e => setEditImage(e.target.files[0])}
              />

              {/* ===== EDIT ITEMS ===== */}
              {editItems.map((i, idx) => (
                <div
                  key={idx}
                  className="border rounded p-2 mb-2"
                >
                  <div className="fw-bold mb-2">{i.item?.name}</div>

                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        className="form-control"
                        placeholder="Qty"
                        value={i.qty}
                        onChange={e => {
                          const x = [...editItems];
                          x[idx].qty = e.target.value;
                          setEditItems(x);
                        }}
                      />
                    </div>

                    <div className="col-6">
                      <input
                        className="form-control"
                        placeholder="Price"
                        value={i.sellingPrice}
                        onChange={e => {
                          const x = [...editItems];
                          x[idx].sellingPrice = e.target.value;
                          setEditItems(x);
                        }}
                      />
                    </div>

                    <div className="col-12 text-end">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          setEditItems(editItems.filter((_, i2) => i2 !== idx))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <hr />

              {/* ===== ADD ITEM ===== */}
              <h6>Add Item</h6>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-5">
                  <Select
                    placeholder="Select Item"
                    options={stock.filter(s => s.qty > 0).map(s => ({
                      value: s.id,
                      label: `${s.item.name} | ₹${s.buyingPrice} | qty ${s.qty}`,
                      stockObj: s
                    }))}
                    value={
                      stock
                        .map(s => ({
                          value: s.id,
                          label: `${s.item.name} | ₹${s.buyingPrice} | qty ${s.qty}`,
                          stockObj: s
                        }))
                        .find(opt => opt.value === editNewItem.stockId) || null
                    }
                    onChange={opt => {
                      if (!opt) return;
                      const s = opt.stockObj;

                      setEditNewItem({
                        stockId: s.id,
                        itemId: s.item.id,
                        itemName: s.item.name,
                        buyingPrice: s.buyingPrice,
                        sellingPrice: s.buyingPrice,
                        qty: 1
                      });
                    }}
                  />
                </div>

                <div className="col-6 col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Qty"
                    value={editNewItem.qty}
                    onChange={e =>
                      setEditNewItem({ ...editNewItem, qty: e.target.value })
                    }
                  />
                </div>

                <div className="col-6 col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Price"
                    value={editNewItem.sellingPrice}
                    onChange={e =>
                      setEditNewItem({
                        ...editNewItem,
                        sellingPrice: e.target.value
                      })
                    }
                  />
                </div>

                <div className="col-12 col-md-2">
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={e => {
                      e.preventDefault();

                      if (!editNewItem.itemId || !editNewItem.qty) {
                        alert("Select item and qty");
                        return;
                      }

                      setEditItems(prev => [
                        ...prev,
                        {
                          itemId: editNewItem.itemId,
                          item: { name: editNewItem.itemName },
                          qty: Number(editNewItem.qty),
                          buyingPrice: Number(editNewItem.buyingPrice),
                          sellingPrice: Number(editNewItem.sellingPrice)
                        }
                      ]);

                      setEditNewItem({
                        stockId: "",
                        itemId: "",
                        itemName: "",
                        sellingPrice: "",
                        qty: ""
                      });
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* ===== ACTIONS ===== */}
              <button
                className="btn btn-success w-100"
                onClick={saveEdit}
                disabled={isEditing}
              >
                {isEditing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>

            </div>
          </div>
        </div>
      )}


      {showInvoice && invoiceData && (
        <div className="modal show d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog modal-lg modal-fullscreen-sm-down">
            <div className="modal-content">

              {/* ===== HEADER ===== */}
              <div className="modal-header">
                <h5 className="modal-title">
                  Invoice #{invoiceData.billNo}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowInvoice(false)}
                />
              </div>

              {/* ===== BODY ===== */}
              <div className="modal-body">

                <div className="mb-3">
                  <p className="mb-1">
                    <b>Customer:</b> {invoiceData.customer?.name}
                  </p>
                  <p className="mb-0">
                    <b>Date:</b> {formatDate(invoiceData.billDate)}
                  </p>
                  <p
                    className={`mb-0 p-2 rounded ${Number(invoiceData?.totalProfit || 0) < 0
                      ? "bg-danger-subtle text-danger"
                      : "bg-success-subtle text-success"
                      }`}
                  >
                    <b>Profit:</b> ₹{Number(invoiceData?.totalProfit || 0).toFixed(2)}
                  </p>
                </div>

                {/* ===== DESKTOP TABLE ===== */}
                <table className="table table-bordered d-none d-md-table">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((i, idx) => (
                      <tr key={idx}>
                        <td>{i.item?.name}</td>
                        <td className="text-end">₹{i.sellingPrice}</td>
                        <td className="text-end">{i.qty}</td>
                        <td className="text-end">
                          ₹{i.qty * i.sellingPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ===== MOBILE CARDS ===== */}
                <div className="d-md-none">
                  {invoiceData.items.map((i, idx) => (
                    <div
                      key={idx}
                      className="border rounded p-2 mb-2"
                    >
                      <div className="fw-bold mb-1">
                        {i.item?.name}
                      </div>

                      <div className="d-flex justify-content-between">
                        <span>Price</span>
                        <span>₹{i.sellingPrice}</span>
                      </div>

                      <div className="d-flex justify-content-between">
                        <span>Qty</span>
                        <span>{i.qty}</span>
                      </div>

                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total</span>
                        <span>
                          ₹{i.qty * i.sellingPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}



      {showPayment && paymentOrder && (
        <div className="modal show d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
            <div className="modal-content">

              {/* ===== HEADER ===== */}
              <div className="modal-header">
                <h5 className="modal-title">
                  Payment – Bill {paymentOrder.billNo}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPayment(false)}
                />
              </div>

              {/* ===== BODY ===== */}
              <div className="modal-body">

                {/* SUMMARY */}
                <div className="border rounded p-3 mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Total</span>
                    <b>₹{paymentOrder.totalAmount}</b>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span>Paid</span>
                    <b>₹{paymentOrder.paidAmount}</b>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span>Status</span>
                    <span
                      className={`badge ${paymentOrder.paymentStatus === "paid"
                        ? "bg-success"
                        : paymentOrder.paymentStatus === "partial"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                        }`}
                    >
                      {paymentOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* ADD PAYMENT */}
                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter amount"
                    value={paymentForm.amount}
                    onChange={e =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Payment Mode</label>
                  <select
                    className="form-select"
                    value={paymentForm.paymentMode}
                    onChange={e =>
                      setPaymentForm({ ...paymentForm, paymentMode: e.target.value })
                    }
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Paid On</label>
                  <input
                    type="date"
                    className="form-control"
                    value={paymentForm.paidOn}
                    onChange={e =>
                      setPaymentForm({ ...paymentForm, paidOn: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Discount Amount</label>
                  <input type="number"
                    className="form-control"
                    placeholder="Enter amount"
                    value={paymentForm.discountAmount}
                    onChange={e =>
                      setPaymentForm({ ...paymentForm, discountAmount: e.target.value })
                    }
                  />

                </div>
                <button
                  className="btn btn-success w-100 mb-3"
                  onClick={savePayment}
                >
                  Add Payment
                </button>

                {/* PAYMENT HISTORY */}
                <h6 className="mt-3">Payment History</h6>

                {payments.length === 0 ? (
                  <p className="text-muted small">No payments yet</p>
                ) : (
                  <ul className="list-group">
                    {payments.map(p => (
                      <li
                        key={p.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-bold">₹{p.amount}</div>
                          <small className="text-muted">
                            {p.paymentMode} · {p.paidOn} Discount - {p.discountAmount}
                          </small>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

              </div>

              {/* ===== FOOTER ===== */}
              <div className="modal-footer d-sm-none">
                <button
                  className="btn btn-secondary w-100"
                  onClick={() => setShowPayment(false)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

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
