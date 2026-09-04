const KEY = "thanjai-orders-v2";
const SETTINGS_KEY = "thanjai-settings-v1";
const API_BASE_URL = "http://localhost:5000/api";

export const DEFAULT_SETTINGS = {
  storeName: "Taste of Thanjai",
  storeTagline: "FOOD TRUCK",
  address: "Thanjavur Highway, Tamil Nadu",
  phone: "+91 98765 43210",
  gstNumber: "",
  taxPercent: 0,
  billPrefix: "TT",
  currencySymbol: "₹",
  receiptFooter: "Thank You! Visit Again!",
  enableDarkMode: false,
};

// Sync LocalStorage Orders
export const getLocalOrders = () => {
  const data = localStorage.getItem(KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to parse orders from localStorage:", err);
    }
  }
  return [];
};

export const saveLocalOrders = (orders) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Failed to save orders:", err);
  }
};

// Fetch orders from MySQL Backend API (with LocalStorage fallback)
export const fetchOrders = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      saveLocalOrders(data);
      return data;
    }
  } catch (err) {
    console.log("MySQL API unavailable, falling back to LocalStorage:", err.message);
  }
  return getLocalOrders();
};

export const getOrders = () => {
  return getLocalOrders();
};

// Create Order in MySQL Backend API
export const createOrder = (order, existing = []) => {
  const orders = [order, ...existing];
  saveLocalOrders(orders);

  // Async push to MySQL Backend
  fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Order saved to MySQL database:", data);
    })
    .catch((err) => {
      console.warn("Could not sync order to MySQL API server (working offline):", err.message);
    });

  return orders;
};

// Update Menu Item Price in MySQL Backend API
export const syncMenuPriceApi = async (id, price) => {
  try {
    await fetch(`${API_BASE_URL}/menu/${id}/price`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
  } catch (err) {
    console.warn("Could not sync price to MySQL API server:", err.message);
  }
};

export const getSettings = () => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (err) {
      console.error("Failed to parse settings:", err);
    }
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings:", err);
  }
};

export const exportBackupData = () => {
  const data = {
    orders: getLocalOrders(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `thanjai-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const restoreBackupData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data && Array.isArray(data.orders)) {
      saveLocalOrders(data.orders);
      if (data.settings) saveSettings(data.settings);
      return { success: true, count: data.orders.length };
    }
    return { success: false, error: "Invalid backup file format" };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const resetToDemoData = () => {
  saveLocalOrders([]);
  return [];
};
