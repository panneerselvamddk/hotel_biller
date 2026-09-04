import React, { useState } from "react";
import { getMenu, updateMenuPrice, money, filterOrders } from "../data/menuData";
import { syncMenuPriceApi } from "../services/orderService";

export function ItemsPage({ orders }) {
  const [sort, setSort] = useState("Best Selling");
  const [, setPriceVersion] = useState(0);

  const menuItems = getMenu();
  const todayOrders = filterOrders(orders, "Today");

  const aggregatedEntries = todayOrders.flatMap((o) =>
    o.items.map((i) => ({ ...i, order: o }))
  );

  const data = menuItems
    .map((x) => {
      const itemEntries = aggregatedEntries.filter((e) => e.id === x.id);
      const qty = itemEntries.reduce((s, e) => s + e.qty, 0);
      return { ...x, qty, revenue: qty * x.price };
    })
    .sort((x, y) =>
      sort === "Price"
        ? y.price - x.price
        : sort === "Highest Revenue"
        ? y.revenue - x.revenue
        : sort === "Lowest Selling"
        ? x.qty - y.qty
        : y.qty - x.qty
    );

  const handlePriceChange = (id, newPrice) => {
    updateMenuPrice(id, newPrice);
    syncMenuPriceApi(id, newPrice);
    setPriceVersion((v) => v + 1);
  };

  return (
    <main className="items-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">ITEM ANALYTICS & MENU</p>
          <h1>Menu Performance</h1>
          <p className="subtitle">Today’s sales and live price management</p>
        </div>
        <div className="sort-filter">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {["Best Selling", "Highest Revenue", "Lowest Selling", "Price"].map(
              (x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              )
            )}
          </select>
        </div>
      </header>

      <section className="panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Selling Price (₹)</th>
                <th>Quantity Sold Today</th>
                <th>Revenue Today</th>
                <th>Cost Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((x) => (
                <tr key={x.id}>
                  <td>
                    <span className={`type-dot ${x.type}`} />
                    <b>{x.name}</b>
                  </td>
                  <td>{x.category}</td>
                  <td>
                    <input
                      className="price-edit"
                      type="number"
                      min="0"
                      value={x.price}
                      onChange={(e) => handlePriceChange(x.id, e.target.value)}
                    />
                  </td>
                  <td>{x.qty} sold</td>
                  <td>
                    <b>{money(x.revenue)}</b>
                  </td>
                  <td>
                    <input
                      className="cost"
                      placeholder="Set cost"
                      type="number"
                      min="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
