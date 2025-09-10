import React from "react";

export default function Boton({ texto, type = "submit", ...rest }) {
  return (
    <button className="btn" type={type} {...rest}>
      {texto}
    </button>
  );
}
