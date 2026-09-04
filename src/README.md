# Taste of Thanjai POS

Responsive food-truck POS with localStorage billing, seeded sales analytics, receipts, date filters, payment tracking, and menu/item analytics.

## Run

`npm install` then `npx vite`

## Structure

- `services/orderService.js` — local API-shaped persistence seam for future FastAPI/MySQL integration
- `main.jsx` — dashboard, POS, receipt, navigation, and reusable presentation units
- `styles.css` — responsive orange/white/black POS interface

Orders are persisted under `thanjai-orders` in localStorage. Delete that key from browser storage to restore the realistic seeded sales data.
