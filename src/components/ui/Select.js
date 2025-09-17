import React from "react";

export default function Select({ options = [], ...rest }) {
  return (
    <select className="tarifa-select">
      <option value="normal">Normal</option>
      <option value="joven">Jóven</option>
      <option value="prm">PRM</option>
    </select>
  );
}
