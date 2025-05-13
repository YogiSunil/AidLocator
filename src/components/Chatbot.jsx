import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setMode } from "../features/resources/resourceSlice";
import { OpenAI } from "openai";

const baseURL = "https://api.aimlapi.com/v1";
const apiKey = "8ade1b19b91140bbafc10972d368c591";

const api = new OpenAI({
  apiKey,
  baseURL,
  dangerouslyAllowBrowser: true, // Allow running in a browser environment
});

const Chatbot = ({ onQuery }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const dispatch = useDispatch();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const completion = await api.chat.completions.create({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content:
              "You are an aid assistant. Help users find nearby resources like food, shelter, and water.",
          },
          {
            role: "user",
            content: input,
          },
        ],
        temperature: 0.7,
        max_tokens: 256,
      });

      const botMessage = {
        sender: "bot",
        text: completion.choices[0].message.content.trim(),
      };
      setMessages((prev) => [...prev, botMessage]);

      // Dispatch the extracted query to update the mode
      if (botMessage.text.toLowerCase().includes("help")) {
        dispatch(setMode("help"));
      } else {
        dispatch(setMode("need"));
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't process that." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="chatbot bg-gray-800 text-white p-4 rounded-md shadow-md">
      <div className="messages max-h-64 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "user" ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block p-2 rounded-md ${
                msg.sender === "user" ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="input flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 rounded-l-md bg-gray-700 text-white"
          placeholder="Ask for help..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 p-2 rounded-r-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
