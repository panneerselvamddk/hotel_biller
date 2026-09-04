import React, { useState } from "react";
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  Store,
  Receipt,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import {
  saveSettings,
  exportBackupData,
  restoreBackupData,
  resetToDemoData,
} from "../services/orderService";

export function SettingsPage({ storeInfo, setStoreInfo, setOrders }) {
  const [form, setForm] = useState(storeInfo);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(form);
    setStoreInfo(form);
    showToast("Settings saved successfully!");
  };

  const handleExport = () => {
    exportBackupData();
    showToast("Backup exported to JSON file!");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        const res = restoreBackupData(content);
        if (res.success) {
          window.location.reload();
        } else {
          alert(`Failed to restore backup: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all order data to demo seed orders? Current orders will be replaced."
      )
    ) {
      const seed = resetToDemoData();
      setOrders(seed);
      showToast("Data reset to default demo orders!");
    }
  };

  return (
    <main className="settings-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Settings & Configuration</h1>
          <p className="subtitle">
            Manage restaurant profile, tax GST rates, invoice prefix, and data backups
          </p>
        </div>
      </header>

      {toast && (
        <div className="toast-notification">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      <form onSubmit={handleSave} className="settings-grid">
        {/* Store Profile Section */}
        <section className="panel">
          <div className="panelhead">
            <div>
              <h2><Store size={18} /> Restaurant Profile</h2>
              <p>Store identification and contact details</p>
            </div>
          </div>
          <div className="form-group">
            <label>Store Name</label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Tagline / Subtitle</label>
            <input
              type="text"
              value={form.storeTagline}
              onChange={(e) => handleChange("storeTagline", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
        </section>

        {/* Tax & Invoice Configuration */}
        <section className="panel">
          <div className="panelhead">
            <div>
              <h2><Receipt size={18} /> Tax & Invoice Setup</h2>
              <p>GST rate, bill prefix, and receipt settings</p>
            </div>
          </div>
          <div className="form-group">
            <label>GSTIN Number</label>
            <input
              type="text"
              value={form.gstNumber}
              onChange={(e) => handleChange("gstNumber", e.target.value)}
              placeholder="e.g. 33AAAAA0000A1Z5"
            />
          </div>
          <div className="form-group">
            <label>GST Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="28"
              step="0.5"
              value={form.taxPercent}
              onChange={(e) => handleChange("taxPercent", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Invoice Bill Prefix</label>
            <input
              type="text"
              value={form.billPrefix}
              onChange={(e) => handleChange("billPrefix", e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Receipt Footer Note</label>
            <input
              type="text"
              value={form.receiptFooter}
              onChange={(e) => handleChange("receiptFooter", e.target.value)}
            />
          </div>

          <div className="form-actions" style={{ marginTop: "24px" }}>
            <button type="submit" className="primary full">
              <Save size={16} /> Save Settings
            </button>
          </div>
        </section>

        {/* Data Management & Backup */}
        <section className="panel full-width">
          <div className="panelhead">
            <div>
              <h2><ShieldCheck size={18} /> Data Management & Backups</h2>
              <p>Export or restore sales data, or reset to initial state</p>
            </div>
          </div>
          <div className="backup-actions-row">
            <button type="button" className="btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export JSON Backup
            </button>

            <label className="btn-secondary file-label">
              <Upload size={16} /> Restore JSON Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: "none" }}
              />
            </label>

            <button type="button" className="btn-danger" onClick={handleResetData}>
              <RefreshCw size={16} /> Reset Demo Sales Data
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
