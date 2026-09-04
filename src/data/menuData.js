import dosaImage from "../assets/dosa.png";
import nonVegDosaImage from "../assets/nonveg-dosa.png";
import idlyImage from "../assets/idly.png";
import chapathiImage from "../assets/chapathi.png";

export const CATS = [
  "Veg Dosas",
  "Non-Veg Dosas",
  "Veg Idly",
  "Non-Veg Idly",
  "Chapathi",
];

export const COLORS = ["#f97316", "#fb923c", "#fbbf24", "#ef4444", "#78350f"];

export const DEFAULT_MENU = [
  ["vd-dosa", "Dosa", "Veg Dosas", 30, "veg"],
  ["vd-roast", "Roast", "Veg Dosas", 40, "veg"],
  ["vd-rava", "Rava Dosa", "Veg Dosas", 50, "veg"],
  ["vd-onion", "Onion Dosa", "Veg Dosas", 50, "veg"],
  ["vd-oothappam", "Onion Oothappam", "Veg Dosas", 60, "veg"],
  ["vd-ghee", "Ghee Roast", "Veg Dosas", 60, "veg"],
  ["vd-podi", "Podi Dosa", "Veg Dosas", 60, "veg"],
  ["vd-guntur", "Guntur Kaara Dosa", "Veg Dosas", 60, "veg"],
  ["vd-ghee-rava", "Ghee Rava Dosa", "Veg Dosas", 70, "veg"],
  ["vd-ghee-podi", "Ghee Podi Dosa", "Veg Dosas", 70, "veg"],
  ["vd-poond", "Poond(u) Podi Dosa", "Veg Dosas", 70, "veg"],
  ["vd-murungai", "Murungai Podi Dosa", "Veg Dosas", 70, "veg"],
  ["vd-curry", "Curry Leaves Podi Dosa", "Veg Dosas", 70, "veg"],
  ["vd-butter", "Butter Dosa", "Veg Dosas", 80, "veg"],
  ["vd-poond-dosa", "Poond(u) Dosa", "Veg Dosas", 80, "veg"],
  ["vd-mushroom", "Mushroom Dosa", "Veg Dosas", 80, "veg"],
  ["nv-chicken", "Chicken Kari Dosa", "Non-Veg Dosas", 100, "nonveg"],
  ["nv-prawn", "Prawn Dosa", "Non-Veg Dosas", 120, "nonveg"],
  ["nv-prawn-half", "Prawn Half Boil Dosa", "Non-Veg Dosas", 130, "nonveg"],
  ["nv-half", "Half Boil Dosa", "Non-Veg Dosas", 50, "nonveg"],
  ["nv-egg", "Egg Dosa", "Non-Veg Dosas", 50, "nonveg"],
  ["nv-kaara", "Kaara Egg Dosa", "Non-Veg Dosas", 60, "nonveg"],
  ["vi-idly", "Idly", "Veg Idly", 10, "veg"],
  ["vi-poond", "Poond(u) Podi Idly", "Veg Idly", 20, "veg"],
  ["vi-curry", "Curry Leaves Podi Idly", "Veg Idly", 20, "veg"],
  ["vi-mini", "Mini Idly Bowl (16 pcs)", "Veg Idly", 50, "veg"],
  ["nvi-chicken", "Chicken Kari Idly", "Non-Veg Idly", 25, "nonveg"],
  ["nvi-egg", "Egg Kothu Idly", "Non-Veg Idly", 50, "nonveg"],
  ["nvi-kothu", "Chicken Kothu Idly", "Non-Veg Idly", 60, "nonveg"],
  ["ch-normal", "Normal Chapathi", "Chapathi", 15, "veg"],
  ["ch-egg", "Egg Chapathi", "Chapathi", 25, "nonveg"],
  ["ch-kothu", "Kothu Chapathi", "Chapathi", 40, "veg"],
  ["ch-chicken", "Chicken Kothu Chapathi", "Chapathi", 50, "nonveg"],
].map(([id, name, category, price, type]) => ({
  id,
  name,
  category,
  price,
  type,
  cost: 0,
  active: true,
}));

export const PRICE_KEY = "thanjai-menu-price-overrides";

export function getMenu() {
  const savedPrices = JSON.parse(localStorage.getItem(PRICE_KEY) || "{}");
  return DEFAULT_MENU.map((item) => ({
    ...item,
    price: savedPrices[item.id] !== undefined ? savedPrices[item.id] : item.price,
  }));
}

export function updateMenuPrice(id, price) {
  const value = Math.max(0, Number(price) || 0);
  const savedPrices = JSON.parse(localStorage.getItem(PRICE_KEY) || "{}");
  savedPrices[id] = value;
  localStorage.setItem(PRICE_KEY, JSON.stringify(savedPrices));
}

export function menuImage(item) {
  if (item.category === "Veg Dosas") return dosaImage;
  if (item.category === "Non-Veg Dosas") return nonVegDosaImage;
  if (item.category.includes("Idly")) return idlyImage;
  return chapathiImage;
}

export function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function dateRange(key, custom) {
  let t = new Date(),
    s = new Date(t);
  if (key === "Yesterday") {
    s.setDate(t.getDate() - 1);
    t.setDate(t.getDate() - 1);
  }
  if (key === "Last 7 Days") s.setDate(t.getDate() - 6);
  if (key === "This Month") s.setDate(1);
  if (key === "Custom Date" && custom) {
    s = new Date(custom);
    t = new Date(custom);
  }
  return [s.toDateString(), t.toDateString()];
}

export function filterOrders(orders, key, custom) {
  let [s, e] = dateRange(key, custom);
  return orders.filter((o) => {
    let d = new Date(o.date).toDateString();
    return new Date(d) >= new Date(s) && new Date(d) <= new Date(e);
  });
}

export function generateSeedOrders() {
  return [];
}
