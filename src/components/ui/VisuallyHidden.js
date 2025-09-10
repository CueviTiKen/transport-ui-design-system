import React from "react";

export default function VisuallyHidden({ children, as: Tag = "span" }) {
  return (
    <Tag
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        margin: "-1px",
        padding: 0,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
        border: 0
      }}
    >
      {children}
    </Tag>
  );
}
