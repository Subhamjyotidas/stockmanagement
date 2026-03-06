import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Items from "./pages/Items";
import Stock from "./pages/Stock";
import StockHistory from "./pages/StockHistory";
import Orders from "./pages/Orders";
import Payments from "./pages/PaymentHistory";
import OrderedItemHistory from "./pages/OrderedItemHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import BuyerPayments from "./pages/BuyerPayments";
import Voucher from "./pages/Voucher";
import PriceTiers from "./pages/PriceTiers";
import AssignPriceTier from "./pages/AssignPriceTier";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
      <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
      <Route path="/stock-history" element={<ProtectedRoute><StockHistory /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/payment-history" element={<ProtectedRoute><Payments /></ProtectedRoute>}/>
      <Route path="/ordered-item-history" element={<ProtectedRoute><OrderedItemHistory /></ProtectedRoute>} />
      <Route path="/buyer-payments" element={<ProtectedRoute><BuyerPayments /></ProtectedRoute>} />
      <Route path="/voucher" element={<ProtectedRoute><Voucher /></ProtectedRoute>} />
      <Route path="/price-tiers" element={<ProtectedRoute><PriceTiers /></ProtectedRoute>} />
      <Route path="/price-tiers/assign" element={<ProtectedRoute><AssignPriceTier /></ProtectedRoute>} />
      </Routes>  );
      
}
