// index.js ou index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root"); // Certifique-se que o id é "root" no HTML
const root = ReactDOM.createRoot(rootElement); // Cria a raiz com React 18

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
