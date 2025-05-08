import React from 'react';
import './Sidebar.css'; // We'll need to add the styles for the sidebar.

const Sidebar = ({ onNewChat, onSave, onLoadThreads, threads }) => {
  return (
    <div className="sidebar">
      <button onClick={onNewChat}>New Chat</button>
      <button onClick={onSave}>Save Chat</button>
      <div>
        <h3>Saved Threads</h3>
        <ul>
          {threads.map((thread, index) => (
            <li key={index} onClick={() => onLoadThreads(thread)}>
              {thread.title || `Thread ${index + 1}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
