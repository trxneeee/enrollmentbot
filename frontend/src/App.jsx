import { useState, useEffect, useRef } from "react";
import axios from "axios";
import React from "react";
import "./App.css"; // Import the CSS file
import { IoSend } from "react-icons/io5";
import { FaTrashAlt } from "react-icons/fa";
import logo from "./assets/logo.png"; // update path if needed



function App() {
  const [threads, setThreads] = useState([]); // Stores conversation threads
  const [currentThread, setCurrentThread] = useState(null); // Active thread ID
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatboxRef = useRef(null);

  useEffect(() => {
    loadThreads(); // Load saved threads on startup
  }, []);

  const loadThreads = () => {
    const savedThreads = JSON.parse(localStorage.getItem("threads")) || [];
    setThreads(savedThreads);
  };

  const saveThreads = (updatedThreads) => {
    localStorage.setItem("threads", JSON.stringify(updatedThreads));
  };

  const createNewThread = () => {
    const newThread = {
      threadNumber: Date.now().toString(),
      messages: [],
    };
    setThreads((prev) => {
      const updatedThreads = [newThread, ...prev];
      saveThreads(updatedThreads);
      return updatedThreads;
    });
    setCurrentThread(newThread.threadNumber);
    setMessages([]);
  };

  const loadThreadMessages = (threadNumber) => {
    const thread = threads.find((t) => t.threadNumber === threadNumber);
    if (thread) {
      setCurrentThread(threadNumber);
      setMessages(thread.messages);
    }
  };

  const deleteThread = (threadNumberToDelete) => {
    const updatedThreads = threads.filter(thread => thread.threadNumber !== threadNumberToDelete);
    setThreads(updatedThreads);
    saveThreads(updatedThreads);
  
    // Clear messages if the deleted thread was the current one
    if (threadNumberToDelete === currentThread) {
      setCurrentThread(null);
      setMessages([]);
    }
  };
  

  const sendMessage = async (message) => {
    if (!message.trim()) return;
  
    let newThreadCreated = false;
  
    if (!currentThread) {
      const newThread = {
        threadNumber: Date.now().toString(),
        messages: [{ text: message, sender: "user" }],
      };
      setThreads((prev) => {
        const updatedThreads = [newThread, ...prev];
        saveThreads(updatedThreads);
        return updatedThreads;
      });
      setCurrentThread(newThread.threadNumber);
      setMessages([{ text: message, sender: "user" }]);
      newThreadCreated = true;
    } else {
      setMessages((prev) => [...prev, { text: message, sender: "user" }]);
    }
  
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/chat", {
        message: message,
        thread_number: currentThread,
      });
  
      const botMessage = { text: response.data.reply, sender: "bot" };
  
      setMessages((prev) => [...prev, botMessage]);
  
      setThreads((prev) => {
        const updatedThreads = prev.map((thread) =>
          thread.threadNumber === currentThread
            ? { ...thread, messages: [...thread.messages, { text: message, sender: "user" }, botMessage] }
            : thread
        );
        saveThreads(updatedThreads);
        return updatedThreads;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { text: "Error connecting to chatbot.", sender: "bot" }]);
    }
  
    setInput("");
  };
  

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="app-container">
      {/* Sidebar for Threads */}
      <div className="sidebar">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
  <img src={logo} alt="Logo" style={{ maxWidth: "100%", height: "100px", objectFit: "contain" }} />
</div>
        <button className="new-chat-button" onClick={createNewThread}>
          + New Chat
        </button>
        <ul>
  {threads
    .filter((thread) => thread.messages.length > 0)
    .map((thread) => {
      const firstMessage = thread.messages[0].text;
      return (
        <li
          key={thread.threadNumber}
          className={thread.threadNumber === currentThread ? "active-thread" : "inactive-thread"}
        >
          <span onClick={() => loadThreadMessages(thread.threadNumber)} style={{ cursor: "pointer", flex: 1 }}>
            {firstMessage.length > 25 ? firstMessage.substring(0, 25) + "..." : firstMessage}
          </span>
          <button
  onClick={() => deleteThread(thread.threadNumber)}
  style={{
    marginLeft: "10px",
    background: "none",
    border: "none",
    color: "red",
    cursor: "pointer"
  }}
  title="Delete this thread"
>
  <FaTrashAlt size={16} />
</button>

        </li>
      );
    })}
</ul>
      </div>

      {/* Chatbox */}
      <div className="chat-container">
        <h2></h2>
        <div className="chatbox" ref={chatboxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message-container ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
              <p className={`message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong>{" "}
                <span dangerouslySetInnerHTML={{ __html: String(msg.text).replace(/\n/g, "<br />") }} />
              </p>
            </div>
          ))}
        </div>

        {/* Input & Send Button */}
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(input);
              }
            }}
            placeholder="Type a prompt..."
            className="chat-input"
          />
          <button onClick={() => sendMessage(input)} className="send-button" title="Send">
  <IoSend size={20} />
</button>
        </div>
      </div>
    </div>
  );
}

export default App;
