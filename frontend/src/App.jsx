// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ChatBox from "./ChatBox.jsx";
import HomePage from "./HomePage.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatBox />} />
    </Routes>
  );
};

export default App;
