import React from "react";
import {
  Banknote,
  Smartphone,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Layers,
  IndianRupee,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DatePicker } from "./DatePicker";
import { OrdersTable } from "./OrdersTable";
import { CATS, COLORS, money, filterOrders } from "../data/menuData";

function aggregate(orders) {
  let entries = orders.flatMap((o) => o.items.map((i) => ({ ...i, order: o })));
  let revenue = orders.reduce((s, o) => s + o.total, 0);
  let qty = entries.reduce((s, i) => s + i.qty, 0);

  let cats = CATS.map((c) => {
    let a = entries.filter((i) => i.category === c);
    let rev = a.reduce((s, i) => s + i.qty * i.price, 0);
    return {
      name: c,
      value: rev,
      qty: a.reduce((s, i) => s + i.qty, 0),
      pct: revenue ? Math.round((rev / revenue) * 100) : 0,
    };
  });

  let topsMap = entries.reduce((a, i) => {
    let v = a[i.id] || { ...i, qty: 0, revenue: 0 };
    v.qty += i.qty;
    v.revenue += i.qty * i.price;
    a[i.id] = v;
    return a;
  }, {});
  let tops = Object.values(topsMap).sort((a, b) => b.qty - a.qty);

  let payments = ["Cash", "UPI", "Card"].map((name) => ({
    name,
    value: orders
      .filter((o) => o.payment === name)
      .reduce((s, o) => s + o.total, 0),
  }));

  return {
    revenue,
    qty,
    orders: orders.length,
    avg: orders.length ? Math.round(revenue / orders.length) : 0,
    cats,
    tops,
    payments,
    entries,
  };
}

export function Dashboard({ orders, range, setRange, custom, setCustom, storeInfo }) {
  const filtered = filterOrders(orders, range, custom);
  const a = aggregate(filtered);

  const hourly = Array.from({ length: 15 }, (_, i) => ({
    hour: `${i + 8}:00`,
    sales: filtered
      .filter((o) => new Date(o.date).getHours() === i + 8)
      .reduce((s, o) => s + o.total, 0),
  }));

  return (
    <main className="dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h1>
            Welcome, {storeInfo?.storeName || "Taste of Thanjai"}
          </h1>
          <p className="subtitle">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <DatePicker range={range} setRange={setRange} custom={custom} setCustom={setCustom} />
      </header>

      {/* KPI Cards Grid */}
      <section className="kpis">
        <div className="kpi">
          <div>
            <small>Total Revenue</small>
            <strong>{money(a.revenue)}</strong>
            <em>+ live sales data</em>
          </div>
          <i className="kpi-icon"><TrendingUp size={20} /></i>
        </div>
        <div className="kpi">
          <div>
            <small>Total Orders</small>
            <strong>{a.orders}</strong>
            <em>+ live count</em>
          </div>
          <i className="kpi-icon"><ShoppingBag size={20} /></i>
        </div>
        <div className="kpi">
          <div>
            <small>Items Sold</small>
            <strong>{a.qty}</strong>
            <em>+ total units</em>
          </div>
          <i className="kpi-icon"><Layers size={20} /></i>
        </div>
        <div className="kpi">
          <div>
            <small>Avg Order Value</small>
            <strong>{money(a.avg)}</strong>
            <em>+ per order</em>
          </div>
          <i className="kpi-icon"><IndianRupee size={20} /></i>
        </div>
      </section>

      {/* Charts Row */}
      <section className="chart-grid">
        <div className="panel wide">
          <div className="panelhead">
            <div>
              <h2>Sales Overview</h2>
              <p>Hourly revenue breakdown ({range})</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(x) => `₹${x}`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panelhead">
            <div>
              <h2>Category Contribution</h2>
              <p>Revenue distribution</p>
            </div>
          </div>
          <div className="pie-chart-wrapper">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={a.cats}
                  dataKey="value"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {a.cats.map((x, i) => (
                    <Cell key={x.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legends-list">
            {a.cats.map((c, i) => (
              <div className="legend" key={c.name}>
                <span style={{ background: COLORS[i % COLORS.length] }} />
                <span className="cat-name">{c.name}</span>
                <b>{c.pct}%</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics & Breakdown Grid */}
      <section className="chart-grid">
        <div className="panel">
          <div className="panelhead">
            <div>
              <h2>Top Selling Items</h2>
              <p>Ranked by quantity sold</p>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {!a.tops.length ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#999", padding: "20px" }}>
                      No items sold in selected period
                    </td>
                  </tr>
                ) : (
                  a.tops.slice(0, 5).map((x, i) => (
                    <tr key={x.id}>
                      <td><b>{i + 1}</b></td>
                      <td>{x.name}</td>
                      <td>{x.qty}</td>
                      <td><b>{money(x.revenue)}</b></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panelhead">
            <div>
              <h2>Payment Methods</h2>
              <p>Collections by payment mode</p>
            </div>
          </div>
          <div className="payments-list">
            {a.payments.map((p, i) => (
              <div key={p.name} className="payment">
                <span className={`payicon p${i}`}>
                  {i === 0 ? (
                    <Banknote size={18} />
                  ) : i === 1 ? (
                    <Smartphone size={18} />
                  ) : (
                    <CreditCard size={18} />
                  )}
                </span>
                <div>
                  <b>{p.name}</b>
                  <small>{money(p.value)}</small>
                </div>
                <strong className="pct-badge">
                  {a.revenue ? Math.round((p.value / a.revenue) * 100) : 0}%
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Orders Section */}
      <OrdersTable orders={filtered.slice(0, 8)} title="Recent Orders" subtitle="Latest transactions" />
    </main>
  );
}
