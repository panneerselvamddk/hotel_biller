import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import { Nav } from "./components/Nav";
import { Dashboard } from "./components/Dashboard";
import { POS } from "./components/POS";
import { OrdersTable } from "./components/OrdersTable";
import { ItemsPage } from "./components/ItemsPage";
import { DatePicker } from "./components/DatePicker";

import { getOrders, fetchOrders, getSettings } from "./services/orderService";
import { today, filterOrders } from "./data/menuData";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [orders, setOrders] = useState(() => getOrders());
  const [storeInfo] = useState(() => getSettings());
  const [range, setRange] = useState("Today");
  const [custom, setCustom] = useState(today());

  useEffect(() => {
    fetchOrders().then((data) => {
      if (Array.isArray(data)) {
        setOrders(data);
      }
    });
  }, []);

  let content;
  if (page === "Dashboard") {
    content = (
      <Dashboard
        orders={orders}
        range={range}
        setRange={setRange}
        custom={custom}
        setCustom={setCustom}
        storeInfo={storeInfo}
      />
    );
  } else if (page === "Billing / POS") {
    content = (
      <POS
        orders={orders}
        setOrders={setOrders}
        storeInfo={storeInfo}
      />
    );
  } else if (page === "Items") {
    content = <ItemsPage orders={orders} />;
  } else if (page === "Orders" || page === "Daily Sales") {
    const filtered = filterOrders(orders, range, custom);
    content = (
      <main className="orders-page">
        <header className="page-header">
          <div>
            <p className="eyebrow">{page.toUpperCase()}</p>
            <h1>{page}</h1>
            <p className="subtitle">Track transactions and order history</p>
          </div>
          <DatePicker
            range={range}
            setRange={setRange}
            custom={custom}
            setCustom={setCustom}
          />
        </header>
        <OrdersTable
          orders={filtered}
          title={`${page} List`}
          subtitle={`Showing ${filtered.length} transactions for ${range}`}
          showSearch={true}
        />
      </main>
    );
  } else {
    content = (
      <main>
        <header className="page-header">
          <div>
            <p className="eyebrow">ADMIN</p>
            <h1>{page}</h1>
          </div>
        </header>
        <section className="panel placeholder">
          <h2>{page} center</h2>
          <p>This panel is currently inactive.</p>
        </section>
      </main>
    );
  }

  return (
    <div className="app">
      <Nav page={page} setPage={setPage} storeInfo={storeInfo} />
      {content}
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}
