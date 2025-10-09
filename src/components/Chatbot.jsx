import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setMode } from "../features/resources/resourceSlice";
import MiniLoadingSpinner from "./MiniLoadingSpinner";

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
      // Get user location and search for real resources
      const searchForRealResources = async (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();
        
        // Determine resource type from message
        let resourceType = 'food'; // default
        let amenityType = 'food_bank';
        let emoji = '🍽️';
        let resourceName = 'food assistance';
        
        if (lowerMessage.includes('food') || lowerMessage.includes('hungry') || lowerMessage.includes('eat')) {
          resourceType = 'food';
          amenityType = 'food_bank';
          emoji = '🍽️';
          resourceName = 'food assistance';
        } else if (lowerMessage.includes('shelter') || lowerMessage.includes('housing') || lowerMessage.includes('homeless')) {
          resourceType = 'shelter';
          amenityType = 'social_facility';
          emoji = '🏠';
          resourceName = 'emergency shelters';
        } else if (lowerMessage.includes('medical') || lowerMessage.includes('health') || lowerMessage.includes('doctor')) {
          resourceType = 'medical';
          amenityType = 'clinic';
          emoji = '🏥';
          resourceName = 'medical facilities';
        } else if (lowerMessage.includes('emergency') || lowerMessage.includes('crisis')) {
          return "🚨 If you're in immediate danger, please call 911. For crisis support: • Crisis Text Line: Text HOME to 741741 • National Suicide Prevention Lifeline: 988. I can also help you find local emergency resources - what type of help do you need?";
        } else {
          return "I'm here to help you find real community resources! I can search for: 🍽️ Food banks, 🏠 Emergency shelters, 🏥 Medical clinics. What type of help are you looking for today?";
        }

        try {
          // Get user's location
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });

          const { latitude, longitude } = position.coords;
          
          // Import the API service dynamically
          const { default: ResourceAPIService } = await import('../services/resourceAPI');
          
          // Search for actual resources
          const resources = await ResourceAPIService.fetchOpenStreetMapResources(
            latitude, 
            longitude, 
            amenityType
          );

          if (resources && resources.length > 0) {
            const nearestResource = resources[0]; // Get the closest one
            const distance = ResourceAPIService.calculateDistance(
              latitude, longitude, 
              nearestResource.latitude, nearestResource.longitude
            ).toFixed(1);

            return `${emoji} Great! I found ${resources.length} ${resourceName} options near you.\n\n📍 **Nearest: ${nearestResource.name}**\n📍 ${nearestResource.address}\n📏 ${distance}km away\n\n${nearestResource.hours ? '🕒 ' + nearestResource.hours : ''}\n${nearestResource.contactInfo ? '📞 ' + nearestResource.contactInfo : ''}\n\nCheck the map above for all ${resources.length} locations!`;
          } else {
            return `${emoji} I'm searching for ${resourceName} in your area, but didn't find any in OpenStreetMap data right now. Try checking:\n\n• 211 (dial 2-1-1) for local resources\n• Local community centers\n• Religious organizations\n• City/county social services\n\nYou can also use the search categories above to explore more options!`;
          }
          
        } catch (locationError) {
          return `${emoji} I'd like to help you find ${resourceName}, but I need location access to show you nearby options. Please:\n\n1. Click "Allow" when asked for location\n2. Or search by address in the main search\n3. Try the ${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} category button above\n\nI'm here to help once you enable location access! 📍`;
        }
      };

      const response = await searchForRealResources(messageText);
      
      const botMessage = {
        sender: "bot",
        text: response,
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
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm">
              <MiniLoadingSpinner text="Finding resources for you..." />
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
