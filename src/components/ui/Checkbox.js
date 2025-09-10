import React from "react";

export default function Checkbox({ label, id, ...rest }) {
  return (
    <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
      <input id={id} type="checkbox" {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
