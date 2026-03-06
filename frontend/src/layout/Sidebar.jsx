import { FaUsers, FaBox, FaClipboardList } from "react-icons/fa";

export default function Sidebar({ isOpen, onClose, onOpenCalc }) {
  return (
    <>
      {/* Desktop sidebar */}
      <div
        className="bg-dark text-white vh-110 p-3 d-none d-md-block"
        style={{ width: "240px" }}
      >
        <SidebarContent onOpenCalc={onOpenCalc} />
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 vh-100 bg-dark text-white p-3 overflow-y-auto"
          style={{ width: "240px", zIndex: 1050 }}
        >
          <button
            className="btn btn-sm btn-light mb-3"
            onClick={onClose}
          >
            ✕ Close
          </button>

          <SidebarContent
            onClick={onClose}
            onOpenCalc={onOpenCalc}
          />
        </div>
      )}
    </>
  );
}


function SidebarContent({ onClick,onOpenCalc}) {
  return (
    <>
      <h4 className="mb-4">Admin</h4>

      <ul className="nav flex-column gap-2">
        <li className="nav-item">
          <a className="nav-link text-white" href="/dashboard" onClick={onClick}>
            <FaClipboardList /> Dashboard
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link text-white" href="/customers" onClick={onClick}>
            <FaUsers /> Customers
          </a>
        </li>

        <li className="nav-item">
          <div className="nav-link text-white">
            <FaBox /> Price Tiers
          </div>
          <ul className="nav flex-column ms-3">
            <li className="nav-item">
              <a className="nav-link text-white" href="/price-tiers" onClick={onClick}>
                ▸ Manage Tiers
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="/price-tiers/assign" onClick={onClick}>
                ▸ Assign to Customers
              </a>
            </li>
          </ul>
        </li>

        <li className="nav-item">
          <a className="nav-link text-white" href="/items" onClick={onClick}>
            <FaBox /> Items
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link text-white" href="/stock" onClick={onClick}>
            <FaBox /> Stock
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white" href="/stock-history" onClick={onClick}>
            <FaBox /> Stock History
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link text-white" href="/orders" onClick={onClick}>
            <FaBox /> Order
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white" href="/payment-history" onClick={onClick}>
            <FaBox /> Payment History
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white" href="/ordered-item-history" onClick={onClick}>
            <FaBox /> Ordered item history
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white" href="/buyer-payments" onClick={onClick}>
            <FaBox /> Buyer Payments
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-white" href="/voucher" onClick={onClick}>
            <FaBox /> Voucher
          </a>
        </li>
         <li className="nav-item">
          <button
            type="button"
            className="nav-link text-white btn btn-link text-start"
            onClick={() => {
              onOpenCalc?.();
              onClick?.();
            }}
          >
            🧮 Calculator
          </button>
        </li>
      </ul>
    </>
  );
}
