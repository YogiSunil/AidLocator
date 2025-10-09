import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setMode } from "../features/resources/resourceSlice";

const Chatbot = ({ onQuery }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm your AI assistant. I can help you find resources like food, shelter, medical care, and more. What do you need help with today?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "🍽️ I need food",
    "🏠 I need shelter",
    "🏥 Medical help",
    "💰 Financial assistance",
    "🚨 Emergency help"
  ];

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { 
      sender: "user", 
      text: messageText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Generate a mock response instead of using the API
      const generateMockResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('food') || lowerMessage.includes('hungry') || lowerMessage.includes('eat')) {
          return "🍽️ I understand you need food assistance. I can help you find food banks, soup kitchens, and meal programs in your area. Would you like me to search for food resources near you? You can also check the Food category in the main search.";
        } else if (lowerMessage.includes('shelter') || lowerMessage.includes('housing') || lowerMessage.includes('homeless')) {
          return "🏠 I can help you find emergency shelters and housing assistance. Many shelters provide temporary housing, meals, and support services. Would you like me to find shelters in your area? Check the Shelter category for immediate options.";
        } else if (lowerMessage.includes('medical') || lowerMessage.includes('health') || lowerMessage.includes('doctor')) {
          return "🏥 For medical assistance, I can help you locate free clinics, community health centers, and medical resources. If this is a medical emergency, please call 911 immediately. Otherwise, let me help you find healthcare resources nearby.";
        } else if (lowerMessage.includes('emergency') || lowerMessage.includes('crisis') || lowerMessage.includes('help')) {
          return "🚨 If you're in immediate danger, please call 911. For crisis support, you can also call: • Crisis Text Line: Text HOME to 741741 • National Suicide Prevention Lifeline: 988. How else can I assist you in finding resources?";
        } else if (lowerMessage.includes('water') || lowerMessage.includes('thirsty')) {
          return "💧 I can help you find water distribution points and locations with free drinking water. Many community centers and some businesses provide free water access. Would you like me to search for water resources in your area?";
        } else if (lowerMessage.includes('clothing') || lowerMessage.includes('clothes')) {
          return "👕 I can help you find clothing banks, thrift stores with free programs, and donation centers. Many organizations provide free clothing for families in need. Let me help you locate clothing resources nearby.";
        } else {
          return "I'm here to help you find community resources! I can assist you with finding: 🍽️ Food banks and meal programs, 🏠 Emergency shelters, 🏥 Medical clinics, 💧 Water access points, 👕 Clothing assistance. What type of help are you looking for today?";
        }
      };

      // Simulate a brief delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));

      const botMessage = {
        sender: "bot",
        text: generateMockResponse(messageText),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);

      // Smart mode switching based on conversation
      const lowerText = messageText.toLowerCase();
      if (lowerText.includes("add") || lowerText.includes("donate") || lowerText.includes("contribute")) {
        dispatch(setMode("help"));
      } else if (lowerText.includes("need") || lowerText.includes("find") || lowerText.includes("help me")) {
        dispatch(setMode("need"));
      }

    } catch (error) {
      console.error("AI API Error:", error);
      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: "I'm having trouble connecting right now. You can still search for resources using the search bar above, or try the quick category buttons! 🔍",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert('Voice input not available');
      };

      recognition.start();
    } else {
      alert('Voice input not supported in your browser');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              msg.sender === "user" 
                ? "bg-blue-600 text-white rounded-br-sm" 
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.sender === "user" ? "text-blue-100" : "text-gray-500"
              }`}>
                {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Quick options:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSend(reply)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send)"
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="1"
              style={{ maxHeight: '100px' }}
            />
            {input.length === 0 && (
              <button
                onClick={handleVoiceInput}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Voice input"
              >
                🎤
              </button>
            )}
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors min-w-10 h-10 flex items-center justify-center"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "📤"
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>AI Assistant powered by Mistral AI</span>
          <span>{input.length}/500</span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
