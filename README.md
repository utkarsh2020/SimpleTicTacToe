# SimpleTicTacToe

A comprehensive **Tic-Tac-Toe game project** with multiple implementations and advanced features including AI opponents and real-time multiplayer support.

## **Architecture Overview**

The project follows a **dual-frontend architecture** with a robust backend:

* **Simple Frontend**: Vanilla JavaScript implementation (root level)
* **Modern Frontend**: React-based application with Tailwind CSS
* **Backend**: FastAPI server with advanced game features
* **Database**: MongoDB for persistence
* **Real-time Communication**: WebSocket support for multiplayer

## **Key Components**

### **1. Simple Frontend (Root Level)**
- **`index.html`**: Basic HTML structure with a 3x3 grid for the game board
- **`script.js`**: Vanilla JavaScript game logic with:
  - Click event handling for cell placement
  - Winner detection algorithm
  - Game state management
  - Turn-based gameplay (X vs O)
- **`style.css`**: Styling for the game interface

### **2. React Frontend (`frontend/` directory)**
- **Modern React application** with component-based architecture
- **Tailwind CSS** for styling
- **Package.json** shows dependencies including React 18, testing libraries, and build tools
- **Components directory** with modular React components
- **GitHub Pages deployment** configured

### **3. Backend (`backend/` directory)**
- **`server.py`**: FastAPI application with comprehensive features:
  - **Game Logic**: Winner checking, board validation, move processing
  - **AI Implementation**: Minimax algorithm with alpha-beta pruning
  - **Multiplayer Support**: WebSocket-based real-time gameplay
  - **Room System**: Create and join game rooms
  - **MongoDB Integration**: Persistent game state storage
  - **CORS enabled** for cross-origin requests

### **4. AI Features**
- **Three difficulty levels**:
  - **Easy**: Random moves
  - **Medium**: 70% optimal play
  - **Hard**: Perfect play using minimax with alpha-beta pruning
- **Smart move generation** that blocks winning moves and finds optimal plays

### **5. Multiplayer System**
- **WebSocket connections** for real-time gameplay
- **Room-based multiplayer** with unique room IDs
- **Connection management** for handling multiple players
- **Game state synchronization** across clients

## **Technical Stack**

* **Backend**: FastAPI, Python, MongoDB, WebSockets
* **Frontend**: React, Tailwind CSS, Vanilla JavaScript
* **Database**: MongoDB for game state persistence
* **Deployment**: GitHub Pages (frontend), Uvicorn server (backend)

## **Getting Started**

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud instance)

### **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
# Set up MongoDB connection in .env file
python server.py
```

### **Frontend Setup (React)**
```bash
cd frontend
npm install
npm start
```

### **Simple Frontend**
Open `index.html` directly in your browser for the vanilla JavaScript version.

## **API Endpoints**

- `GET /api/health` - Health check
- `POST /api/room` - Create new game room
- `GET /api/room/{room_id}` - Get room details
- `POST /api/ai-move` - Get AI move suggestion
- `WebSocket /api/ws/{room_id}` - Real-time multiplayer connection

## **Features**

✅ **Single Player vs AI** with multiple difficulty levels  
✅ **Real-time Multiplayer** with WebSocket support  
✅ **Room-based gameplay** for organized matches  
✅ **Persistent game state** with MongoDB  
✅ **Modern React UI** with Tailwind CSS  
✅ **Classic vanilla JS** implementation  
✅ **Comprehensive testing** and validation  

## **Testing & Quality**

The project includes comprehensive testing covering:
- API endpoints (health check, room creation/retrieval)
- AI move generation across all difficulty levels
- WebSocket multiplayer functionality

See `test_result.md` for detailed test results.

## **Deployment**

- **Frontend**: Configured for GitHub Pages deployment
- **Backend**: Ready for deployment with Uvicorn/Gunicorn

## **Contributing**

This project demonstrates both educational value (simple vanilla JS version) and production-ready features (React frontend, robust backend with AI and multiplayer support).

## **License**

Open source - feel free to use and modify for learning and development purposes.
