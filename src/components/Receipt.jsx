import React from "react";
import { X, Printer } from "lucide-react";
import { money } from "../data/menuData";

export function Receipt({ order, close, storeInfo }) {
  if (!order) return null;

  const rawSubtotal = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const discountVal = Number(order.discount || 0);
  const grandTotal = Math.max(0, rawSubtotal - discountVal);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modalback print-overlay">
      <div className="receipt modal-content printable-receipt">
        <button className="close no-print" onClick={close} aria-label="Close receipt">
          <X size={18} />
        </button>

        <div className="receipt-header">
          <h2>{storeInfo?.storeName || "TASTE OF THANJAI"}</h2>
          <p className="sub">{storeInfo?.storeTagline || "FOOD TRUCK"}</p>
          {storeInfo?.address && <p className="addr">{storeInfo.address}</p>}
          {storeInfo?.phone && <p className="ph">Ph: {storeInfo.phone}</p>}
        </div>

        <hr className="receipt-divider" />

        <div className="receipt-meta">
          <div>
            Bill No: <b>{order.id}</b>
          </div>
          <div>Date: {new Date(order.date).toLocaleString("en-IN")}</div>
        </div>

        <hr className="receipt-divider" />

        <div className="receipt-items">
          {order.items.map((i, idx) => (
            <div key={i.id + idx} className="rline">
              <div className="rline-left">
                <span>{i.name}</span>
                <small>
                  {i.qty} × {money(i.price)}
                </small>
              </div>
              <b className="rline-right">{money(i.qty * i.price)}</b>
            </div>
          ))}
        </div>

        <hr className="receipt-divider" />

        <div className="receipt-totals">
          <div>
            <span>Subtotal</span>
            <b>{money(rawSubtotal)}</b>
          </div>
          {discountVal > 0 && (
            <div>
              <span>Discount</span>
              <b>- {money(discountVal)}</b>
            </div>
          )}
          <h3 className="receipt-grand">
            <span>TOTAL</span>
            <b>{money(grandTotal)}</b>
          </h3>
        </div>

        <hr className="receipt-divider" />

        <div className="receipt-footer">
          <p>Payment Mode: <b>{order.payment}</b></p>
          <h4>{storeInfo?.receiptFooter || "Thank You! Visit Again!"}</h4>
        </div>

        <div className="receipt-actions no-print">
          <button className="primary full print-btn" onClick={handlePrint}>
            <Printer size={18} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
