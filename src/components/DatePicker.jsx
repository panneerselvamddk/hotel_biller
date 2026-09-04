import React from "react";

export function DatePicker({ range, setRange, custom, setCustom }) {
  return (
    <div className="date-filter">
      <select value={range} onChange={(e) => setRange(e.target.value)}>
        {["Today", "Yesterday", "Last 7 Days", "This Month", "Custom Date"].map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
      {range === "Custom Date" && (
        <input
          type="date"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
      )}
    </div>
  );
}
