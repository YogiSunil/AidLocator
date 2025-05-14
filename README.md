# 🌍 AidLocator

AidLocator is a real-time interactive map application built to help people in crisis find essential aid like food, water, shelter, and clothing. It also empowers volunteers and organizations to mark donation points and provide help to those in need.

This full-stack app uses React, Redux Toolkit, and OpenStreetMap with AI-powered assistance to deliver a smart, responsive, and accessible experience.

## ✨ Key Features

- 📍 **Real-Time Location Detection** – Uses geolocation to find and display nearby resources.
- 🧭 **Two Modes:**
  - **Need Help:** Displays nearby aid points like food, shelter, water, and clothing.
  - **Help Someone:** Allows volunteers to add donation/resource locations.
- 🗂️ **Category Filtering** – Filter resources by type (e.g., Food, Shelter, Water, Clothing).
- 🗺️ **Interactive OpenStreetMap Integration** – View and interact with aid markers on a live map.
- 🧠 **AI-Powered Suggestions** – GPT helps suggest nearby aid locations based on natural language queries.
- 📝 **Add New Resources** – Form for submitting aid points with human-readable addresses (using geocoding).
- 🔄 **Live Resource List** – Resources update based on user location and selected filters.
- ⚠️ **Error & Loading States** – Smooth handling of geolocation errors or network issues.

---

## 🧠 How AI Is Used & Why It’s Helpful

Artificial Intelligence was integrated into AidLocator to make the app more intelligent and user-centric. Here's how AI improved the app:

- **Smart Search Interpretation:** The AI understands context and needs without relying solely on keyword filters.
- **During Development:** OpenAI (ChatGPT) helped with:
  - Code generation and optimization
  - UI/UX decisions
  - Geolocation and filtering logic
  - AI backend integration
  - Debugging and edge case handling

**Result:** The AI integration made the system smarter, more intuitive, and capable of delivering real help in real-time.

---

## 🚀 How to Run Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/YogiSunil/AidLocator.git
   cd AidLocator
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Start the Backend Server**
   ```bash
   node src/server.js
   ```
   Backend runs at http://localhost:5000

4. **Start the Frontend App**
   ```bash
   npm start
   ```
   Frontend runs at http://localhost:5173



## 🛠️ Tech Stack

- **Frontend:** React, Redux Toolkit, Tailwind CSS, React-Leaflet (OpenStreetMap)
- **Backend:** Node.js, Express
- **AI Integration:** OpenAI-compatible API via AIMLAPI
- **Build Tool:** Vite

---

## 🙌 Acknowledgements

- OpenStreetMap – for open-source maps
- Leaflet – map rendering library
- Redux Toolkit – efficient state management
- OpenAI – AI for intelligent location suggestions and development support
- ChatGPT – guidance, bug fixing, and project planning

