import React, { useState } from 'react';
import { sendChatMessage } from '../services/chatService.js';
import './ChatPanel.css';

const ChatPanel = ({ isOpen, onClose, documentId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Convert messages to format expected by API
      const messageHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const aiResponse = await sendChatMessage(documentId, inputMessage, messageHistory);
      
      const responseMessage = {
        text: aiResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      // Add error message to chat
      const errorMessage = {
        text: error.message,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <h3>Chat about this document</h3>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
          >
            <p>{message.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about this document..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel; 