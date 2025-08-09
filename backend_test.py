#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Tic Tac Toe Game
Tests all API endpoints, WebSocket functionality, AI logic, and database integration
"""

import requests
import json
import asyncio
import websockets
import time
import sys
from typing import Dict, List, Any

# Configuration
BACKEND_URL = "http://localhost:8001"
WS_URL = "ws://localhost:8001"

class TicTacToeBackendTester:
    def __init__(self):
        self.test_results = []
        self.room_ids = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_health_check(self):
        """Test basic API health check"""
        try:
            response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
            if response.status_code == 200 and response.json().get("status") == "ok":
                self.log_test("Health Check", True, "Server is running and responding")
                return True
            else:
                self.log_test("Health Check", False, f"Unexpected response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection failed: {str(e)}")
            return False

    def test_create_room(self):
        """Test room creation endpoint"""
        try:
            response = requests.post(f"{BACKEND_URL}/api/create-room", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if "room_id" in data and len(data["room_id"]) == 8:
                    room_id = data["room_id"]
                    self.room_ids.append(room_id)
                    self.log_test("Create Room", True, f"Room created with ID: {room_id}")
                    return True
                else:
                    self.log_test("Create Room", False, f"Invalid room ID format: {data}")
                    return False
            else:
                self.log_test("Create Room", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Room", False, f"Request failed: {str(e)}")
            return False

    def test_get_room_valid(self):
        """Test getting room information with valid room ID"""
        if not self.room_ids:
            self.log_test("Get Room (Valid)", False, "No room IDs available for testing")
            return False
            
        try:
            room_id = self.room_ids[0]
            response = requests.get(f"{BACKEND_URL}/api/room/{room_id}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["room_id", "players", "game_state", "created_at"]
                if all(field in data for field in required_fields):
                    self.log_test("Get Room (Valid)", True, f"Room data retrieved successfully")
                    return True
                else:
                    self.log_test("Get Room (Valid)", False, f"Missing required fields: {data}")
                    return False
            else:
                self.log_test("Get Room (Valid)", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Room (Valid)", False, f"Request failed: {str(e)}")
            return False

    def test_get_room_invalid(self):
        """Test getting room information with invalid room ID"""
        try:
            response = requests.get(f"{BACKEND_URL}/api/room/invalid123", timeout=5)
            if response.status_code == 404:
                self.log_test("Get Room (Invalid)", True, "Correctly returned 404 for invalid room")
                return True
            else:
                self.log_test("Get Room (Invalid)", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Room (Invalid)", False, f"Request failed: {str(e)}")
            return False

    def test_ai_move_easy(self):
        """Test AI move with easy difficulty"""
        empty_board = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]]
        return self._test_ai_move(empty_board, "easy", "Easy AI Move")

    def test_ai_move_medium(self):
        """Test AI move with medium difficulty"""
        partial_board = [["X", "-", "-"], ["-", "O", "-"], ["-", "-", "-"]]
        return self._test_ai_move(partial_board, "medium", "Medium AI Move")

    def test_ai_move_hard(self):
        """Test AI move with hard difficulty"""
        near_win_board = [["X", "X", "-"], ["-", "O", "-"], ["-", "-", "-"]]
        return self._test_ai_move(near_win_board, "hard", "Hard AI Move")

    def test_ai_blocking_move(self):
        """Test AI blocks winning move in hard mode"""
        # Board where X can win on next move at (0,2)
        blocking_board = [["X", "X", "-"], ["O", "-", "-"], ["-", "-", "-"]]
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/ai-move",
                json=blocking_board,
                params={"difficulty": "hard"},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if "row" in data and "col" in data:
                    # AI should block at (0,2)
                    if data["row"] == 0 and data["col"] == 2:
                        self.log_test("AI Blocking Move", True, f"AI correctly blocked at ({data['row']}, {data['col']})")
                        return True
                    else:
                        self.log_test("AI Blocking Move", False, f"AI didn't block winning move, played at ({data['row']}, {data['col']})")
                        return False
                else:
                    self.log_test("AI Blocking Move", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("AI Blocking Move", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("AI Blocking Move", False, f"Request failed: {str(e)}")
            return False

    def test_ai_full_board(self):
        """Test AI with full board"""
        full_board = [["X", "O", "X"], ["O", "X", "O"], ["O", "X", "O"]]
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/ai-move",
                json=full_board,
                params={"difficulty": "hard"},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if "error" in data:
                    self.log_test("AI Full Board", True, "AI correctly handled full board")
                    return True
                else:
                    self.log_test("AI Full Board", False, f"Expected error for full board, got: {data}")
                    return False
            else:
                self.log_test("AI Full Board", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("AI Full Board", False, f"Request failed: {str(e)}")
            return False

    def _test_ai_move(self, board: List[List[str]], difficulty: str, test_name: str):
        """Helper method to test AI moves"""
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/ai-move",
                json=board,
                params={"difficulty": difficulty},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if "row" in data and "col" in data:
                    row, col = data["row"], data["col"]
                    # Verify move is valid (empty cell)
                    if 0 <= row < 3 and 0 <= col < 3 and board[row][col] == "-":
                        self.log_test(test_name, True, f"AI made valid move at ({row}, {col})")
                        return True
                    else:
                        self.log_test(test_name, False, f"AI made invalid move at ({row}, {col})")
                        return False
                else:
                    self.log_test(test_name, False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test(test_name, False, f"Request failed: {str(e)}")
            return False

    async def test_websocket_connection(self):
        """Test WebSocket connection"""
        if not self.room_ids:
            self.log_test("WebSocket Connection", False, "No room IDs available for testing")
            return False
            
        try:
            room_id = self.room_ids[0]
            uri = f"{WS_URL}/api/ws/{room_id}"
            
            async with websockets.connect(uri, timeout=10) as websocket:
                # Test connection established
                self.log_test("WebSocket Connection", True, f"Successfully connected to room {room_id}")
                
                # Test joining room
                join_message = {
                    "type": "join_room",
                    "player_name": "TestPlayer1"
                }
                await websocket.send(json.dumps(join_message))
                
                # Wait for response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5)
                    data = json.loads(response)
                    if data.get("type") == "player_joined":
                        self.log_test("WebSocket Join Room", True, f"Player joined successfully")
                        return True
                    else:
                        self.log_test("WebSocket Join Room", False, f"Unexpected response: {data}")
                        return False
                except asyncio.TimeoutError:
                    self.log_test("WebSocket Join Room", False, "No response received within timeout")
                    return False
                    
        except Exception as e:
            self.log_test("WebSocket Connection", False, f"Connection failed: {str(e)}")
            return False

    async def test_websocket_game_move(self):
        """Test making moves through WebSocket"""
        if not self.room_ids:
            self.log_test("WebSocket Game Move", False, "No room IDs available for testing")
            return False
            
        try:
            room_id = self.room_ids[0]
            uri = f"{WS_URL}/api/ws/{room_id}"
            
            async with websockets.connect(uri, timeout=10) as websocket:
                # Join room first
                join_message = {
                    "type": "join_room",
                    "player_name": "TestPlayer1"
                }
                await websocket.send(json.dumps(join_message))
                await websocket.recv()  # Consume join response
                
                # Make a move
                move_message = {
                    "type": "make_move",
                    "row": 0,
                    "col": 0
                }
                await websocket.send(json.dumps(move_message))
                
                # Wait for game update
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5)
                    data = json.loads(response)
                    if data.get("type") == "game_update" and "game_state" in data:
                        game_state = data["game_state"]
                        if game_state["board"][0][0] == "X":
                            self.log_test("WebSocket Game Move", True, "Move processed successfully")
                            return True
                        else:
                            self.log_test("WebSocket Game Move", False, f"Move not reflected in board: {game_state}")
                            return False
                    else:
                        self.log_test("WebSocket Game Move", False, f"Unexpected response: {data}")
                        return False
                except asyncio.TimeoutError:
                    self.log_test("WebSocket Game Move", False, "No game update received within timeout")
                    return False
                    
        except Exception as e:
            self.log_test("WebSocket Game Move", False, f"Move test failed: {str(e)}")
            return False

    async def test_websocket_game_reset(self):
        """Test game reset through WebSocket"""
        if not self.room_ids:
            self.log_test("WebSocket Game Reset", False, "No room IDs available for testing")
            return False
            
        try:
            room_id = self.room_ids[0]
            uri = f"{WS_URL}/api/ws/{room_id}"
            
            async with websockets.connect(uri, timeout=10) as websocket:
                # Reset game
                reset_message = {
                    "type": "reset_game"
                }
                await websocket.send(json.dumps(reset_message))
                
                # Wait for reset confirmation
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5)
                    data = json.loads(response)
                    if data.get("type") == "game_reset" and "game_state" in data:
                        game_state = data["game_state"]
                        # Check if board is empty
                        empty_board = [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]]
                        if game_state["board"] == empty_board and not game_state["game_over"]:
                            self.log_test("WebSocket Game Reset", True, "Game reset successfully")
                            return True
                        else:
                            self.log_test("WebSocket Game Reset", False, f"Game not properly reset: {game_state}")
                            return False
                    else:
                        self.log_test("WebSocket Game Reset", False, f"Unexpected response: {data}")
                        return False
                except asyncio.TimeoutError:
                    self.log_test("WebSocket Game Reset", False, "No reset confirmation received within timeout")
                    return False
                    
        except Exception as e:
            self.log_test("WebSocket Game Reset", False, f"Reset test failed: {str(e)}")
            return False

    def test_database_connection(self):
        """Test MongoDB connection by creating and retrieving a room"""
        try:
            # Create a room (this tests database write)
            response = requests.post(f"{BACKEND_URL}/api/create-room", timeout=5)
            if response.status_code != 200:
                self.log_test("Database Connection", False, "Failed to create room for database test")
                return False
                
            room_id = response.json()["room_id"]
            
            # Retrieve the room (this tests database read)
            response = requests.get(f"{BACKEND_URL}/api/room/{room_id}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data["room_id"] == room_id:
                    self.log_test("Database Connection", True, "Database read/write operations successful")
                    return True
                else:
                    self.log_test("Database Connection", False, "Data integrity issue in database")
                    return False
            else:
                self.log_test("Database Connection", False, "Failed to retrieve room from database")
                return False
        except Exception as e:
            self.log_test("Database Connection", False, f"Database test failed: {str(e)}")
            return False

    def test_error_handling(self):
        """Test various error conditions"""
        tests_passed = 0
        total_tests = 3
        
        # Test invalid JSON for AI move
        try:
            response = requests.post(f"{BACKEND_URL}/api/ai-move", json="invalid", timeout=5)
            if response.status_code >= 400:
                tests_passed += 1
        except:
            pass
            
        # Test invalid board format
        try:
            response = requests.post(f"{BACKEND_URL}/api/ai-move", json=[[1, 2]], timeout=5)
            if response.status_code >= 400:
                tests_passed += 1
        except:
            pass
            
        # Test non-existent endpoint
        try:
            response = requests.get(f"{BACKEND_URL}/api/nonexistent", timeout=5)
            if response.status_code == 404:
                tests_passed += 1
        except:
            pass
        
        if tests_passed >= 2:
            self.log_test("Error Handling", True, f"Passed {tests_passed}/{total_tests} error handling tests")
            return True
        else:
            self.log_test("Error Handling", False, f"Only passed {tests_passed}/{total_tests} error handling tests")
            return False

    async def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Tic Tac Toe Backend Testing")
        print("=" * 60)
        
        # Basic API tests
        print("📡 Testing Basic API Endpoints...")
        health_ok = self.test_health_check()
        if not health_ok:
            print("❌ Server not responding. Stopping tests.")
            return
            
        self.test_create_room()
        self.test_create_room()  # Create multiple rooms
        self.test_get_room_valid()
        self.test_get_room_invalid()
        
        # AI functionality tests
        print("🤖 Testing AI Functionality...")
        self.test_ai_move_easy()
        self.test_ai_move_medium()
        self.test_ai_move_hard()
        self.test_ai_blocking_move()
        self.test_ai_full_board()
        
        # WebSocket tests
        print("🔌 Testing WebSocket Functionality...")
        await self.test_websocket_connection()
        await self.test_websocket_game_move()
        await self.test_websocket_game_reset()
        
        # Database tests
        print("🗄️ Testing Database Integration...")
        self.test_database_connection()
        
        # Error handling tests
        print("⚠️ Testing Error Handling...")
        self.test_error_handling()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["passed"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["passed"]:
                print(f"  • {result['test']}")
        
        return passed, total

async def main():
    """Main test runner"""
    tester = TicTacToeBackendTester()
    
    try:
        passed, total = await tester.run_all_tests()
        
        if passed == total:
            print(f"\n🎉 ALL TESTS PASSED! Backend is fully functional.")
            sys.exit(0)
        else:
            print(f"\n⚠️ {total - passed} tests failed. Backend needs attention.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Testing failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())