import { render, screen } from "@testing-library/react";
import App from "./App";

test("muestra el título y los botones principales", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /sistema de diseño/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /claro/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /oscuro/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /alto contraste/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /buscar/i })).toBeInTheDocument();
});
