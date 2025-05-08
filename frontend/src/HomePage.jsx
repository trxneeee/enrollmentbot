import React, { useState } from 'react';
import './HomePage.css';  // Custom CSS for styling
import { useNavigate } from "react-router-dom";
import logo from './assets/logo.png';

const HomePage = () => {
  const [webhookId, setWebhookId] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const navigate = useNavigate();
  const handleStartChat = (e) => {
    e.preventDefault(); // ⬅️ prevent page reload
    navigate("/chat");
  };

  return (
    <div className="app-container">
      {!chatStarted ? (
        <div className="auth-container">
          <h1 className="title">
            Welcome to <span className="highlight">UB SIT Enrollment AI Support</span>
          </h1>
          <p className="description">
            Seamless AI-powered conversations designed to assist you with enrollment queries. Start chatting in seconds!
          </p>

          <form 
            onSubmit={handleStartChat} 
            className="auth-form"
          >
                        <button
              type="submit"
              className="start-chat-btn"
            >
              Start Chat
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-wrapper">
                      <button
              type="submit"
              className="start-chat-btn"
            >
              Start Chat
            </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
