import React, { useState } from "react";
import { Search } from "lucide-react";
import { money } from "../data/menuData";

export function OrdersTable({ orders, title = "Recent Orders", subtitle = "Latest billing activity", showSearch = false }) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(query.toLowerCase()) ||
          o.payment.toLowerCase().includes(query.toLowerCase()) ||
          o.items.some((i) => i.name.toLowerCase().includes(query.toLowerCase()))
      )
    : orders;

  return (
    <section className="panel orders">
      <div className="panelhead">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {showSearch && (
          <div className="table-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search bill no, item..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Time / Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <b className="bill-badge">{o.id}</b>
                  </td>
                  <td>
                    {new Date(o.date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    <small style={{ color: "#888" }}>
                      {new Date(o.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </td>
                  <td>
                    {o.items[0]?.name} × {o.items[0]?.qty}
                    {o.items.length > 1 && (
                      <span className="item-more-badge">+{o.items.length - 1} more</span>
                    )}
                  </td>
                  <td>
                    <b>{money(o.total)}</b>
                  </td>
                  <td>
                    <span className={`pay-tag ${o.payment.toLowerCase()}`}>{o.payment}</span>
                  </td>
                  <td>
                    <span className="status">Paid</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
