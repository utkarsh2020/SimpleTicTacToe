from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
import uuid
import random
from datetime import datetime

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/tictactoe')
client = MongoClient(MONGO_URL)
db = client.tictactoe
games_collection = db.games
rooms_collection = db.rooms

# Models
class GameState(BaseModel):
    board: List[List[str]]
    current_player: str
    game_over: bool
    winner: Optional[str]
    is_draw: bool

class Room(BaseModel):
    room_id: str
    players: List[str]
    game_state: GameState
    created_at: datetime

class AIMove(BaseModel):
    row: int
    col: int

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except:
                    pass

manager = ConnectionManager()

# Game logic
def create_empty_board():
    return [["-" for _ in range(3)] for _ in range(3)]

def check_winner(board):
    # Check rows
    for row in board:
        if row[0] == row[1] == row[2] != "-":
            return row[0]
    
    # Check columns
    for col in range(3):
        if board[0][col] == board[1][col] == board[2][col] != "-":
            return board[0][col]
    
    # Check diagonals
    if board[0][0] == board[1][1] == board[2][2] != "-":
        return board[0][0]
    if board[0][2] == board[1][1] == board[2][0] != "-":
        return board[0][2]
    
    return None

def is_board_full(board):
    for row in board:
        if "-" in row:
            return False
    return True

def get_available_moves(board):
    moves = []
    for i in range(3):
        for j in range(3):
            if board[i][j] == "-":
                moves.append((i, j))
    return moves

# AI Logic - Minimax algorithm
def minimax(board, depth, is_maximizing, alpha=-float('inf'), beta=float('inf')):
    winner = check_winner(board)
    
    if winner == "O":  # AI wins
        return 10 - depth
    elif winner == "X":  # Human wins
        return depth - 10
    elif is_board_full(board):
        return 0
    
    if is_maximizing:
        max_eval = -float('inf')
        for i in range(3):
            for j in range(3):
                if board[i][j] == "-":
                    board[i][j] = "O"
                    eval_score = minimax(board, depth + 1, False, alpha, beta)
                    board[i][j] = "-"
                    max_eval = max(max_eval, eval_score)
                    alpha = max(alpha, eval_score)
                    if beta <= alpha:
                        break
        return max_eval
    else:
        min_eval = float('inf')
        for i in range(3):
            for j in range(3):
                if board[i][j] == "-":
                    board[i][j] = "X"
                    eval_score = minimax(board, depth + 1, True, alpha, beta)
                    board[i][j] = "-"
                    min_eval = min(min_eval, eval_score)
                    beta = min(beta, eval_score)
                    if beta <= alpha:
                        break
        return min_eval

def get_ai_move(board, difficulty="hard"):
    available_moves = get_available_moves(board)
    
    if not available_moves:
        return None
    
    if difficulty == "easy":
        # Random move
        return random.choice(available_moves)
    elif difficulty == "medium":
        # 70% optimal, 30% random
        if random.random() < 0.7:
            best_score = -float('inf')
            best_move = available_moves[0]
            for move in available_moves:
                board[move[0]][move[1]] = "O"
                score = minimax(board, 0, False)
                board[move[0]][move[1]] = "-"
                if score > best_score:
                    best_score = score
                    best_move = move
            return best_move
        else:
            return random.choice(available_moves)
    else:  # hard
        # Always optimal move
        best_score = -float('inf')
        best_move = available_moves[0]
        for move in available_moves:
            board[move[0]][move[1]] = "O"
            score = minimax(board, 0, False)
            board[move[0]][move[1]] = "-"
            if score > best_score:
                best_score = score
                best_move = move
        return best_move

# API endpoints
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/create-room")
async def create_room():
    room_id = str(uuid.uuid4())[:8]
    game_state = GameState(
        board=create_empty_board(),
        current_player="X",
        game_over=False,
        winner=None,
        is_draw=False
    )
    
    room_data = {
        "room_id": room_id,
        "players": [],
        "game_state": game_state.dict(),
        "created_at": datetime.utcnow()
    }
    
    rooms_collection.insert_one(room_data)
    return {"room_id": room_id}

@app.get("/api/room/{room_id}")
async def get_room(room_id: str):
    room = rooms_collection.find_one({"room_id": room_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room["_id"] = str(room["_id"])
    return room

@app.post("/api/ai-move")
async def make_ai_move(board: List[List[str]], difficulty: str = "hard"):
    ai_move = get_ai_move(board, difficulty)
    if ai_move:
        return {"row": ai_move[0], "col": ai_move[1]}
    return {"error": "No moves available"}

@app.websocket("/api/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "join_room":
                # Add player to room
                room = rooms_collection.find_one({"room_id": room_id})
                if room and len(room["players"]) < 2:
                    rooms_collection.update_one(
                        {"room_id": room_id},
                        {"$addToSet": {"players": message["player_name"]}}
                    )
                    await manager.broadcast_to_room(json.dumps({
                        "type": "player_joined",
                        "player": message["player_name"]
                    }), room_id)
            
            elif message["type"] == "make_move":
                # Process move
                room = rooms_collection.find_one({"room_id": room_id})
                if room:
                    board = room["game_state"]["board"]
                    row, col = message["row"], message["col"]
                    
                    if board[row][col] == "-" and not room["game_state"]["game_over"]:
                        board[row][col] = room["game_state"]["current_player"]
                        
                        winner = check_winner(board)
                        is_draw = is_board_full(board) and not winner
                        game_over = winner is not None or is_draw
                        
                        next_player = "O" if room["game_state"]["current_player"] == "X" else "X"
                        
                        updated_state = {
                            "board": board,
                            "current_player": next_player,
                            "game_over": game_over,
                            "winner": winner,
                            "is_draw": is_draw
                        }
                        
                        rooms_collection.update_one(
                            {"room_id": room_id},
                            {"$set": {"game_state": updated_state}}
                        )
                        
                        await manager.broadcast_to_room(json.dumps({
                            "type": "game_update",
                            "game_state": updated_state
                        }), room_id)
            
            elif message["type"] == "reset_game":
                # Reset game
                game_state = {
                    "board": create_empty_board(),
                    "current_player": "X",
                    "game_over": False,
                    "winner": None,
                    "is_draw": False
                }
                
                rooms_collection.update_one(
                    {"room_id": room_id},
                    {"$set": {"game_state": game_state}}
                )
                
                await manager.broadcast_to_room(json.dumps({
                    "type": "game_reset",
                    "game_state": game_state
                }), room_id)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)