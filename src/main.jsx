import React from "react";
import { createRoot } from "react-dom/client";
import StartPortal from "./StartPortal";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StartPortal />
  </React.StrictMode>
);
