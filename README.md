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
- Python 3.8-3.12 (Python 3.13 may have compatibility issues with some dependencies)
- Node.js 16-22 (Node.js 23+ may show warnings but will work)
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

<<<<<<< HEAD
=======
## **Troubleshooting**

### **Python 3.13 Compatibility Issues**
If you encounter pydantic-core build errors with Python 3.13:

**Option 1: Use Python 3.12 (Recommended)**
```bash
# Using pyenv
pyenv install 3.12.7
pyenv local 3.12.7
pip install -r requirements.txt
```

**Option 2: Try installing with pre-compiled wheels**
```bash
pip install --only-binary=all -r requirements.txt
```

**Option 3: Install dependencies individually**
```bash
pip install fastapi uvicorn websockets pymongo python-dotenv python-multipart
pip install pydantic --pre  # Install pre-release version
```

### **Node.js 23+ Warnings**
If you see Jest/testing library warnings with Node.js 23+, these are harmless:
```bash
# Option 1: Ignore warnings (they're just compatibility notices)
npm install --no-warnings

# Option 2: Use Node.js 22 LTS (recommended for production)
nvm install 22
nvm use 22
npm install
```

### **Common Issues**
- **MongoDB Connection**: Ensure MongoDB is running and accessible
- **Port Conflicts**: Backend runs on port 8001, ensure it's available
- **CORS Issues**: Check that frontend URL is in CORS allowed origins

>>>>>>> a9fffc5d (feat: Add comprehensive project documentation and improve multiplayer functionality)
## **Contributing**

This project demonstrates both educational value (simple vanilla JS version) and production-ready features (React frontend, robust backend with AI and multiplayer support).

## **License**

Open source - feel free to use and modify for learning and development purposes.
