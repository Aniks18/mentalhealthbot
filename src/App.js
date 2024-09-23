import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Send, User, Bot, Menu, X } from "lucide-react";
import './App.css';

export default function App() {
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Load chat history from JSON file
    fetch('/chatHistory.json')
      .then(response => response.json())
      .then(data => setChatHistory(data))
      .catch(error => console.error('Error loading chat history:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    const newMessage = { role: "user", content: userInput };
    setConversation(prev => [...prev, newMessage]);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_input: userInput }),
      });

      const data = await response.json();
      const botMessage = { role: "bot", content: data.response };
      setConversation(prev => [...prev, botMessage]);

      // If this is a new chat, add it to the chat history
      if (activeChat === null) {
        const newChat = {
          id: Date.now(),
          title: userInput,
          messages: [newMessage, botMessage]
        };
        setChatHistory(prev => [...prev, newChat]);
        setActiveChat(newChat.id);
        
        // Save updated chat history to JSON file
        saveChatsToJSON([...chatHistory, newChat]);
      } else {
        // Update existing chat
        const updatedHistory = chatHistory.map(chat => 
          chat.id === activeChat ? { ...chat, messages: [...chat.messages, newMessage, botMessage] } : chat
        );
        setChatHistory(updatedHistory);
        saveChatsToJSON(updatedHistory);
      }
    } catch (error) {
      console.error("Error:", error);
      setConversation(prev => [...prev, { role: "bot", content: "Sorry, there was an error. Please try again." }]);
    }

    setIsLoading(false);
    setUserInput("");
  };

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setConversation(selectedChat.messages);
    }
  };

  const saveChatsToJSON = (chats) => {
    fetch('/saveChats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chats),
    })
    .then(response => response.json())
    .then(data => console.log('Chats saved successfully:', data))
    .catch((error) => console.error('Error saving chats:', error));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="app-container">
      <button className="toggle-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {sidebarOpen && (
        <div className="sidebar">
          <h2>Chat History</h2>
          {chatHistory.map((chat) => (
            <div key={chat.id} className="chat-item" onClick={() => handleChatSelect(chat.id)}>
              {chat.title}
            </div>
          ))}
        </div>
      )}
      <div className="chat-area">
        <div className="chat-container">
          <div className="chat-header">
            <h1>Mental Health Chat</h1>
          </div>

          <div className="chat-content">
            <div className="alert-container" role="alert">
              <AlertTriangle className="alert-icon" />
              <div>
                <p className="alert-title">Research Prototype Warning</p>
                <p>This is a research prototype and not a real mental health service.</p>
              </div>
            </div>

            <div className="messages-container">
              {conversation.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">
                    <div className="message-icon">
                      {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className="message-text">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                className="input-field"
              />
              <button type="submit" className="send-button" disabled={isLoading}>
                <Send size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}