import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css"; // CSS for styling

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  const API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
  const MISTRAL_MODEL = "mistral-small";
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: MISTRAL_MODEL,
          messages: [{ role: "user", content: input }],
          max_tokens: 150,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      const botMessage = {
        sender: "bot",
        text: response.data.choices[0].message.content,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Sorry, I couldn't fetch a response." },
      ]);
    }

    setInput("");
  };

  return (
    <div>
      {/* Floating Button */}
      <button className="chatbot-btn" onClick={() => setShowChat(!showChat)}>
        💬 Chat
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>🍽️ Meal Assistant</span>
            <button onClick={() => setShowChat(false)}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
