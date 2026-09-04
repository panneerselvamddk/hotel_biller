import React, { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  ShoppingBag,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import { Receipt } from "./Receipt";
import {
  getMenu,
  CATS,
  menuImage,
  money,
} from "../data/menuData";
import { createOrder } from "../services/orderService";

export function POS({ orders, setOrders, storeInfo }) {
  const menuList = getMenu();
  const [cat, setCat] = useState("Veg Dosas");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState(1);
  const [payment, setPayment] = useState("UPI");
  const [discount, setDiscount] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const items = menuList.filter(
    (x) =>
      x.active &&
      (query
        ? x.name.toLowerCase().includes(query.toLowerCase())
        : x.category === cat)
  );

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const discountNum = Math.max(0, Number(discount) || 0);
  const total = Math.max(0, subtotal - discountNum);
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const addSelectedItem = () => {
    if (!selected) return;
    setCart((c) => {
      const e = c.find((x) => x.id === selected.id);
      return e
        ? c.map((x) => (x.id === e.id ? { ...x, qty: x.qty + q } : x))
        : [...c, { ...selected, qty: q }];
    });
    showToast(`Added ${q} × ${selected.name}`);
    setSelected(null);
    setQ(1);
  };

  const directAddItem = (e, item) => {
    e.stopPropagation();
    setCart((c) => {
      const existing = c.find((x) => x.id === item.id);
      return existing
        ? c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x))
        : [...c, { ...item, qty: 1 }];
    });
    showToast(`Added ${item.name}`);
  };

  const changeQty = (id, delta) => {
    setCart((c) =>
      c
        .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0)
    );
  };

  const finishOrder = (showReceipt) => {
    if (!cart.length) return;
    const prefix = storeInfo?.billPrefix || "TT";
    const newOrder = {
      id: `${prefix}-${1001 + orders.length}`,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      discount: discountNum,
      total,
      payment,
      status: "Paid",
    };

    const updated = createOrder(newOrder, orders);
    setOrders(updated);

    if (showReceipt) {
      setReceipt(newOrder);
    } else {
      showToast(`Order ${newOrder.id} saved successfully!`);
    }

    setCart([]);
    setDiscount(0);
    setMobileCartOpen(false);
  };

  return (
    <main className="pos">
      <header className="page-header">
        <div>
          <p className="eyebrow">BILLING / POS</p>
          <h1>New Order</h1>
        </div>
        <div className="counter-badge">Counter Online</div>
      </header>

      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle size={16} /> {toastMessage}
        </div>
      )}

      <div className="pos-layout">
        {/* Categories Bar */}
        <section className="categories">
          <h3>Categories</h3>
          <div className="categories-scroll">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCat(c);
                  setQuery("");
                }}
                className={cat === c && !query ? "selected" : ""}
              >
                <span className="cat-label">{c}</span>
                <b className="cat-count">
                  {menuList.filter((x) => x.category === c).length}
                </b>
              </button>
            ))}
          </div>
        </section>

        {/* Menu Section */}
        <section className="menu">
          <div className="search">
            <Search size={18} />
            <input
              placeholder="Search food item by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="clear-search" onClick={() => setQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="menu-title">
            <div>
              <h2>{query ? `Search results for "${query}"` : cat}</h2>
              <p>{items.length} items available</p>
            </div>
          </div>

          <div className="item-grid">
            {items.map((x) => (
              <article
                key={x.id}
                className="item"
                onClick={() => {
                  setSelected(x);
                  setQ(1);
                }}
              >
                <img className="food-image" src={menuImage(x)} alt={x.name} />
                <div className="tag">
                  <span className={`type-dot ${x.type}`} />
                  {x.type === "veg" ? "VEG" : "NON-VEG"}
                </div>
                <h3>{x.name}</h3>
                <div className="item-footer">
                  <strong>{money(x.price)}</strong>
                  <button
                    className="add-btn"
                    onClick={(e) => directAddItem(e, x)}
                    aria-label={`Add ${x.name}`}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Desktop Cart Sidebar */}
        <section className={`cart ${mobileCartOpen ? "mobile-open" : ""}`}>
          <div className="carthead">
            <div>
              <ShoppingBag size={18} />
              <h2>Current Bill</h2>
            </div>
            <span className="cart-badge">{totalCount} items</span>
            {mobileCartOpen && (
              <button
                className="close-cart-btn"
                onClick={() => setMobileCartOpen(false)}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="cartitems">
            {!cart.length ? (
              <div className="empty">
                <p>Your bill is empty</p>
                <small>Tap an item from the menu to add</small>
              </div>
            ) : (
              cart.map((x) => (
                <div className="cartitem" key={x.id}>
                  <div>
                    <b>{x.name}</b>
                    <small>{money(x.price)} each</small>
                  </div>
                  <div className="stepper">
                    <button onClick={() => changeQty(x.id, -1)}>
                      <Minus size={12} />
                    </button>
                    <b>{x.qty}</b>
                    <button onClick={() => changeQty(x.id, 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <strong>{money(x.qty * x.price)}</strong>
                  <button
                    className="remove"
                    onClick={() =>
                      setCart((c) => c.filter((y) => y.id !== x.id))
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="totals">
            <label className="discount-row">
              <span>Discount (₹)</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </label>
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            {discountNum > 0 && (
              <div>
                <span>Discount</span>
                <b>- {money(discountNum)}</b>
              </div>
            )}
            <div className="grand">
              <span>Grand Total</span>
              <strong>{money(total)}</strong>
            </div>

            <div className="paymentsel">
              {["UPI", "Cash", "Card"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPayment(p)}
                  className={payment === p ? "on" : ""}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="cartactions">
              <button
                className="clear-btn"
                onClick={() => {
                  setCart([]);
                  setDiscount(0);
                }}
              >
                Clear
              </button>
              <button className="save-btn" onClick={() => finishOrder(false)}>
                Save
              </button>
              <button className="primary" onClick={() => finishOrder(true)}>
                Generate Bill
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Quick Cart Bar for Mobile */}
      {cart.length > 0 && !mobileCartOpen && (
        <div
          className="mobile-quick-cart"
          onClick={() => setMobileCartOpen(true)}
        >
          <div className="quick-cart-info">
            <span className="quick-count">{totalCount} items</span>
            <span className="quick-total">{money(total)}</span>
          </div>
          <button className="view-cart-btn">
            View Cart <ChevronUp size={18} />
          </button>
        </div>
      )}

      {/* Quantity Modal */}
      {selected && (
        <div className="modalback" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              <X size={18} />
            </button>
            <img className="modal-food" src={menuImage(selected)} alt="" />
            <div className="modal-category">
              <span className={`type-dot ${selected.type}`} />
              <span>{selected.category}</span>
            </div>
            <h2>{selected.name}</h2>
            <strong className="modal-price">{money(selected.price)}</strong>

            <div className="quantity">
              <button onClick={() => setQ(Math.max(1, q - 1))}>
                <Minus size={16} />
              </button>
              <b>{q}</b>
              <button onClick={() => setQ(q + 1)}>
                <Plus size={16} />
              </button>
            </div>

            <button className="primary full" onClick={addSelectedItem}>
              Add to Bill · {money(q * selected.price)}
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <Receipt
          order={receipt}
          close={() => setReceipt(null)}
          storeInfo={storeInfo}
        />
      )}
    </main>
  );
}
