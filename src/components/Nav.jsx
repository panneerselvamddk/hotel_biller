import React, { useState } from "react";
import {
  LayoutDashboard,
  ReceiptIndianRupee,
  ClipboardList,
  ChartNoAxesCombined,
  Package,
  Menu as MenuIcon,
  X,
  UtensilsCrossed,
} from "lucide-react";

export function Nav({ page, setPage, storeInfo }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    ["Dashboard", LayoutDashboard],
    ["Billing / POS", ReceiptIndianRupee],
    ["Orders", ClipboardList],
    ["Daily Sales", ChartNoAxesCombined],
    ["Items", Package],
  ];

  const handleSelect = (n) => {
    setPage(n);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-aside">
        <div className="brand">
          <UtensilsCrossed size={22} className="brand-icon" />
          <div>
            {storeInfo?.storeName || "Taste of Thanjai"}
            <small>{storeInfo?.storeTagline || "FOOD TRUCK"}</small>
          </div>
        </div>
        <nav>
          {navItems.map(([n, Icon]) => (
            <button
              key={n}
              className={page === n ? "active" : ""}
              onClick={() => handleSelect(n)}
            >
              <Icon size={18} />
              <span>{n}</span>
            </button>
          ))}
        </nav>
        <div className="sidefoot">● Counter Online</div>
      </aside>

      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <UtensilsCrossed size={18} className="brand-icon" />
          <div>
            <strong>{storeInfo?.storeName || "Taste of Thanjai"}</strong>
          </div>
        </div>
        <button
          className="mobile-drawer-toggle"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileDrawerOpen ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div className="drawer-title">
                <UtensilsCrossed size={18} className="brand-icon" />
                <span>{storeInfo?.storeName || "Taste of Thanjai"}</span>
              </div>
              <button onClick={() => setMobileDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="drawer-nav">
              {navItems.map(([n, Icon]) => (
                <button
                  key={n}
                  className={page === n ? "active" : ""}
                  onClick={() => handleSelect(n)}
                >
                  <Icon size={20} />
                  <span>{n}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-nav">
        {navItems.slice(0, 5).map(([n, Icon]) => (
          <button
            key={n}
            className={page === n ? "active" : ""}
            onClick={() => handleSelect(n)}
          >
            <Icon size={20} />
            <small>{n.includes("POS") ? "POS" : n.split(" ")[0]}</small>
          </button>
        ))}
      </div>
    </>
  );
}
