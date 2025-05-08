import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatBox from "./App.jsx";
import App from "./HomePage.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<ChatBox  webhookId="5ae7e4f1-dbf0-4259-96b2-093f9c120afb" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
