import React, { useState, useEffect, useRef } from 'react';
import * as chat from '@botpress/chat';
import _ from 'lodash';
import './App.css'; // We'll create this CSS file next
import logo from './assets/logo.png'; 
import { useNavigate } from 'react-router-dom';

const ChatBox = ({ webhookId }) => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [listener, setListener] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize connection
  useEffect(() => {
    const initChat = async () => {
      try {
        const chatClient = await chat.Client.connect({ webhookId });
        setClient(chatClient);
        
        const { conversation } = await chatClient.createConversation({});
        setConversation(conversation);
        
        const conversationListener = await chatClient.listenConversation({
          id: conversation.id,
        });
        
        setListener(conversationListener);
        setIsConnected(true);
        
        // Load initial messages
        const { messages } = await chatClient.listMessages({
          conversationId: conversation.id,
        });
        
        setMessages(_.sortBy(messages, (m) => new Date(m.createdAt).getTime()));
        
        // Set up real-time listener
        conversationListener.on('message_created', (ev) => {
          if (ev.userId === chatClient.user.id) return;
          
          setIsTyping(false);
          setMessages(prev => [...prev, ev]);
        });
        
        conversationListener.on('typing', (ev) => {
          if (ev.userId === chatClient.user.id) return;
          setIsTyping(ev.isTyping);
        });
        
        conversationListener.on('error', (err) => {
          console.error('Connection error:', err);
          setIsConnected(false);
          handleReconnect();
        });
        
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    
    if (webhookId) {
      initChat();
    }
    
    return () => {
      if (listener) {
        listener.disconnect();
      }
    };
  }, [webhookId]);
  
  const handleReconnect = async () => {
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries && !isConnected) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        await listener.connect();
        setIsConnected(true);
        return;
      } catch (err) {
        retries++;
        console.error(`Reconnect attempt ${retries} failed`, err);
      }
    }
    
    console.error('Max reconnection attempts reached');
  };
  
  const sendMessage = async () => {
    if (!inputValue.trim() || !client || !conversation) return;
    
    const messageText = inputValue.trim();
    setInputValue('');
    
    // Add user message to UI immediately
    const userMessage = {
      id: `temp-${Date.now()}`,
      userId: client.user.id,
      payload: { type: 'text', text: messageText },
      createdAt: new Date().toISOString(),
      direction: 'outgoing'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      await client.createMessage({
        conversationId: conversation.id,
        payload: {
          type: 'text',
          text: messageText,
        },
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const formatMessage = (msg) => {
    if (msg.payload.type === 'text') {
      return msg.payload.text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #e60000;">$1</strong>') // bold
      .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #e60000;"><strong>$1</strong></a>') // markdown links
      .replace(/\n/g, '<br />'); // newlines;
    }
    // Add support for other message types (images, cards, etc.)
    return JSON.stringify(msg.payload);
  };
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-container">
    <div className="chat-wrapper">
    <div className="chat-container">
      <div className="chat-header">
        <div className="status-indicator">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Online' : 'Connecting...'}
        </div>
        <h2>Enrollment Chat AI Support</h2>
        <img
      src={logo}
      alt="Logo"
      className="logo"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate('/')}
    />
      </div>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="welcome-message">
              <h3>Hello there!</h3>
              <p>How can I help you today?</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.userId === client?.user.id ? 'outgoing' : 'incoming'}`}
            >
              <div className="message-content">
                <div
                  className="message-text"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
                />
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          ))          
        )}
        {isTyping && (
          <div className="message incoming">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={!isConnected}
        />
        <button 
          onClick={sendMessage} 
          disabled={!inputValue.trim() || !isConnected}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
    </div>
    </div>
  );
};

export default ChatBox;