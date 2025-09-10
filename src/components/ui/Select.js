import React from "react";

export default function Select({ options = [], ...rest }) {
  return (
    <select
      {...rest}
      style={{
        width: "100%",
        padding: "0.625rem 0.75rem",
        fontSize: "1rem",
        border: "1px solid #9ca3af",
        borderRadius: "8px",
        background: "transparent",
        color: "inherit"
      }}
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
