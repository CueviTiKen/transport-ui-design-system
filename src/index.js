import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";   // ➊ tokens primero
import "./styles/App.css";      // ➋ hoja única unificada
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
